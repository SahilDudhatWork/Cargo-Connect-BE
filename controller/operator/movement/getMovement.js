const Movement = require("../../../model/movement/movement");
const { handleException } = require("../../../helper/exception");
const { paginationResponse } = require("../../../utils/paginationFormate");
const { ObjectId } = require("mongoose").Types;
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const fetchMovement = async (req, res) => {
  let { logger, operatorId, query } = req;
  try {
    let { page, limit, sortBy } = query;
    let qry = {};

    if (sortBy == "InProgress") {
      qry = {
        isAssign: true,
        status: "InProgress",
      };
    } else if (sortBy == "Completed") {
      qry = {
        isAssign: true,
        status: "Completed",
      };
    }

    offset = page || 1;
    limit = limit || 10;
    const skip = limit * (offset - 1);
    const getData = await Movement.aggregate([
      { $match: { operatorId: new ObjectId(operatorId) } },
      { $match: qry },
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
      // Fetch TypeOfService
      {
        $lookup: {
          from: "transitinfos",
          let: { typeOfServiceId: "$typeOfService" },
          pipeline: [
            {
              $unwind: "$typeOfService",
            },
            {
              $match: {
                $expr: { $eq: ["$typeOfService._id", "$$typeOfServiceId"] },
              },
            },
            {
              $project: {
                _id: 0,
                title: "$typeOfService.title",
                description: "$typeOfService.description",
                price: "$typeOfService.price",
                _id: "$typeOfService._id",
              },
            },
          ],
          as: "typeOfService",
        },
      },
      {
        $unwind: {
          path: "$typeOfService",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Fetch TypeOfTransportation
      {
        $lookup: {
          from: "transitinfos",
          let: { typeOfTransportationId: "$typeOfTransportation" },
          pipeline: [
            {
              $unwind: "$typeOfTransportation",
            },
            {
              $match: {
                $expr: {
                  $eq: [
                    "$typeOfTransportation._id",
                    "$$typeOfTransportationId",
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                title: "$typeOfTransportation.title",
                description: "$typeOfTransportation.description",
                price: "$typeOfTransportation.price",
                _id: "$typeOfTransportation._id",
              },
            },
          ],
          as: "typeOfTransportation",
        },
      },
      {
        $unwind: {
          path: "$typeOfTransportation",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Fetch ModeOfTransportation
      /// FTL
      {
        $lookup: {
          from: "transitinfos",
          let: { modeOfTransportationFTLId: "$modeOfTransportation.FTL" },
          pipeline: [
            {
              $unwind: "$modeOfTransportation.FTL",
            },
            {
              $match: {
                $expr: {
                  $eq: [
                    "$modeOfTransportation.FTL._id",
                    "$$modeOfTransportationFTLId",
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                title: "$modeOfTransportation.FTL.title",
                description: "$modeOfTransportation.FTL.description",
                price: "$modeOfTransportation.FTL.price",
                _id: "$modeOfTransportation.FTL._id",
              },
            },
          ],
          as: "modeOfTransportation.FTL",
        },
      },
      {
        $addFields: {
          "modeOfTransportation.FTL": {
            $arrayElemAt: ["$modeOfTransportation.FTL", 0],
          },
        },
      },
      {
        $unwind: {
          path: "$typeOfTransportation.FTL",
          preserveNullAndEmptyArrays: true,
        },
      },
      /// LTL
      {
        $lookup: {
          from: "transitinfos",
          let: { modeOfTransportationLTLId: "$modeOfTransportation.LTL" },
          pipeline: [
            {
              $unwind: "$modeOfTransportation.LTL",
            },
            {
              $match: {
                $expr: {
                  $eq: [
                    "$modeOfTransportation.LTL._id",
                    "$$modeOfTransportationLTLId",
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                title: "$modeOfTransportation.LTL.title",
                description: "$modeOfTransportation.LTL.description",
                price: "$modeOfTransportation.LTL.price",
                _id: "$modeOfTransportation.LTL._id",
              },
            },
          ],
          as: "modeOfTransportation.LTL",
        },
      },
      {
        $addFields: {
          "modeOfTransportation.LTL": {
            $arrayElemAt: ["$modeOfTransportation.LTL", 0],
          },
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
      // Fetch Vehicles
      {
        $lookup: {
          from: "vehicles",
          let: { vehicleId: "$vehicleId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$vehicleId"] },
              },
            },
            // TypeOfService
            {
              $lookup: {
                from: "transitinfos",
                let: { typeOfServiceIds: "$typeOfService" },
                pipeline: [
                  {
                    $unwind: "$typeOfService",
                  },
                  {
                    $match: {
                      $expr: {
                        $in: ["$typeOfService._id", "$$typeOfServiceIds"],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      typeOfService: "$typeOfService",
                    },
                  },
                  {
                    $group: {
                      _id: null,
                      typeOfService: { $push: "$typeOfService" },
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      typeOfService: {
                        $cond: {
                          if: { $isArray: "$typeOfService" },
                          then: "$typeOfService",
                          else: [],
                        },
                      },
                    },
                  },
                ],
                as: "typeOfService",
              },
            },
            {
              $addFields: {
                typeOfService: {
                  $cond: {
                    if: { $isArray: "$typeOfService.typeOfService" },
                    then: "$typeOfService.typeOfService",
                    else: [],
                  },
                },
              },
            },
            {
              $unwind: {
                path: "$typeOfService",
                preserveNullAndEmptyArrays: true,
              },
            },
            // typeOfTransportation
            {
              $lookup: {
                from: "transitinfos",
                let: { typeOfTransportationIds: "$typeOfTransportation" },
                pipeline: [
                  {
                    $unwind: "$typeOfTransportation",
                  },
                  {
                    $match: {
                      $expr: {
                        $in: [
                          "$typeOfTransportation._id",
                          "$$typeOfTransportationIds",
                        ],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      typeOfTransportation: "$typeOfTransportation",
                    },
                  },
                  {
                    $group: {
                      _id: null,
                      typeOfTransportation: { $push: "$typeOfTransportation" },
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      typeOfTransportation: {
                        $cond: {
                          if: { $isArray: "$typeOfTransportation" },
                          then: "$typeOfTransportation",
                          else: [],
                        },
                      },
                    },
                  },
                ],
                as: "typeOfTransportation",
              },
            },
            {
              $addFields: {
                typeOfTransportation: {
                  $cond: {
                    if: {
                      $isArray: "$typeOfTransportation.typeOfTransportation",
                    },
                    then: "$typeOfTransportation.typeOfTransportation",
                    else: [],
                  },
                },
              },
            },
            {
              $unwind: {
                path: "$typeOfTransportation",
                preserveNullAndEmptyArrays: true,
              },
            },
            // modeOfTransportation
            {
              $lookup: {
                from: "transitinfos",
                let: {
                  ftlIds: "$modeOfTransportation.FTL",
                  ltlIds: "$modeOfTransportation.LTL",
                },
                pipeline: [
                  {
                    $addFields: {
                      FTL: {
                        $filter: {
                          input: "$modeOfTransportation.FTL",
                          as: "item",
                          cond: { $in: ["$$item._id", "$$ftlIds"] },
                        },
                      },
                      LTL: {
                        $filter: {
                          input: "$modeOfTransportation.LTL",
                          as: "item",
                          cond: { $in: ["$$item._id", "$$ltlIds"] },
                        },
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      FTL: 1,
                      LTL: 1,
                    },
                  },
                ],
                as: "modeOfTransportation",
              },
            },
            {
              $addFields: {
                FTL: {
                  $arrayElemAt: ["$modeOfTransportation.FTL", 0],
                },
                LTL: {
                  $arrayElemAt: ["$modeOfTransportation.LTL", 0],
                },
              },
            },
            {
              $unwind: {
                path: "$modeOfTransportation",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                __v: 0,
                FTL: 0,
                LTL: 0,
              },
            },
          ],
          as: "vehicleData",
        },
      },
      {
        $unwind: {
          path: "$vehicleData",
          preserveNullAndEmptyArrays: true,
        },
      },
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
  fetchMovement,
};
