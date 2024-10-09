const Movement = require("../../../model/movement/movement");
const { handleException } = require("../../../helper/exception");
const { paginationResponse } = require("../../../utils/paginationFormate");
const { ObjectId } = require("mongoose").Types;
const {
  getTypeOfService_TypeOfTransportation_Pipeline,
  fetchVehicles_Pipeline,
} = require("../../../utils/lookups");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const fetchOrder = async (req, res) => {
  let { logger, userId, query } = req;
  try {
    let { page, limit, status } = query;

    offset = page || 1;
    limit = limit || 10;
    const skip = limit * (offset - 1);
    const getData = await Movement.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
          status: status,
        },
      },
      // Fetch Addresses
      {
        $lookup: {
          from: "addresses",
          let: { addressIds: "$pickUpAddressIds" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    "$_id",
                    {
                      $map: {
                        input: "$$addressIds",
                        as: "id",
                        in: { $toObjectId: "$$id" },
                      },
                    },
                  ],
                },
              },
            },
          ],
          as: "pickUpAddressData",
        },
      },
      {
        $lookup: {
          from: "addresses",
          let: { addressIds: "$dropAddressIds" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    "$_id",
                    {
                      $map: {
                        input: "$$addressIds",
                        as: "id",
                        in: { $toObjectId: "$$id" },
                      },
                    },
                  ],
                },
              },
            },
          ],
          as: "dropAddressData",
        },
      },
      // Fetch Operators
      {
        $lookup: {
          from: "operators",
          let: { operatorId: "$operatorId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$operatorId"] },
              },
            },
          ],
          as: "operatorData",
        },
      },
      {
        $unwind: {
          path: "$operatorData",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Fetch port_BridgeOfCrossing
      {
        $lookup: {
          from: "specialrequirements",
          let: { port_BridgeOfCrossingId: "$port_BridgeOfCrossing" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$port_BridgeOfCrossingId"] },
              },
            },
            {
              $project: {
                _id: 0,
                post_bridge: 1,
              },
            },
          ],
          as: "port_BridgeOfCrossing",
        },
      },
      {
        $addFields: {
          port_BridgeOfCrossing: {
            $arrayElemAt: ["$port_BridgeOfCrossing.post_bridge", 0],
          },
        },
      },
      // Fetch specialrequirements
      {
        $lookup: {
          from: "specialrequirements",
          let: { specialRequirements: "$specialRequirements" },
          pipeline: [
            {
              $unwind: "$requirements",
            },
            {
              $match: {
                $expr: {
                  $in: ["$requirements._id", "$$specialRequirements"],
                },
              },
            },
            {
              $project: {
                type: "$requirements.type",
                price: "$requirements.price",
                _id: "$requirements._id",
              },
            },
          ],
          as: "specialRequirements",
        },
      },
      // Fetch userReference
      {
        $lookup: {
          from: "references",
          let: { referencesId: "$userReference" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$referencesId"] },
              },
            },
            {
              $project: {
                __v: 0,
                type: 0,
                createdAt: 0,
                updatedAt: 0,
                clientRelationId: 0,
              },
            },
          ],
          as: "userReference",
        },
      },
      {
        $unwind: {
          path: "$userReference",
          preserveNullAndEmptyArrays: true,
        },
      },
      ...getTypeOfService_TypeOfTransportation_Pipeline(),
      ...fetchVehicles_Pipeline(),
      {
        $facet: {
          paginatedResult: [
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
              $project: {
                __v: 0,
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const result = getData[0];
    let response = await paginationResponse(req, res, offset, limit, result);

    const statusCode =
      response.response.length > 0 ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message =
      response.response.length > 0
        ? INFO_MSGS.SUCCESS
        : ERROR_MSGS.DATA_NOT_FOUND;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: response,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  fetchOrder,
};
