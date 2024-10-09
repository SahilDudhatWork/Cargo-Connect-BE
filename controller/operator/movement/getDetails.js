const Movement = require("../../../model/movement/movement");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  getTypeOfService_TypeOfTransportation_Pipeline,
  fetchVehicles_Pipeline,
} = require("../../../utils/lookups");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const getDetails = async (req, res) => {
  const { logger, params } = req;
  try {
    const { id } = params;

    let getData = await Movement.aggregate([
      {
        $match: {
          movementId: id,
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
      {
        $unwind: {
          path: "$typeOfTransportation.LTL",
          preserveNullAndEmptyArrays: true,
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
      ...getTypeOfService_TypeOfTransportation_Pipeline(),
      ...fetchVehicles_Pipeline(),
      {
        $project: {
          __v: 0,
        },
      },
    ]);

    getData = getData[0];

    const statusCode = getData ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message = getData ? INFO_MSGS.SUCCESS : ERROR_MSGS.DATA_NOT_FOUND;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: getData || null,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  getDetails,
};
