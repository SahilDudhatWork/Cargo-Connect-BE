const RateCard = require("../../../model/common/rateCard");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { paginationResponse } = require("../../../utils/paginationFormate");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const fetchData = async (req, res) => {
  const { logger, query } = req;
  try {
    let { page, limit } = query;

    offset = page || 1;
    limit = limit || 10;
    const skip = limit * (offset - 1);

    const getData = await RateCard.aggregate([
      { $sort: { createdAt: -1 } },
      ...typeOfService(),
      ...typeOfTransportation_modeOfTransportation(),
      ...port_BridgeOfCrossing(),
      ...specialRequirements(),
      {
        $facet: {
          paginatedResult: [
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
              $project: {
                __v: 0,
                typeOfServiceInfo: 0,
                transportationInfo: 0,
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const result = getData[0];
    let response = await paginationResponse(req, res, offset, limit, result);

    return Response.success({
      req,
      res,
      status: response.response.length > 0 ? STATUS_CODE.OK : STATUS_CODE.OK,
      msg:
        response.response.length > 0
          ? INFO_MSGS.SUCCESS
          : ERROR_MSGS.DATA_NOT_FOUND,
      data: response,
    });
  } catch (error) {
    return handleException(logger, res, error);
  }
};

const typeOfService = () => [
  {
    $unwind: {
      path: "$typeOfService",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: "transitinfos",
      let: { serviceId: "$typeOfService._id" },
      pipeline: [
        { $unwind: "$typeOfService" },
        {
          $match: {
            $expr: { $eq: ["$typeOfService._id", "$$serviceId"] },
          },
        },
        {
          $project: {
            _id: 0,
            title: "$typeOfService.title",
            description: "$typeOfService.description",
            _id: "$typeOfService._id",
          },
        },
      ],
      as: "typeOfServiceInfo",
    },
  },
  {
    $unwind: {
      path: "$typeOfServiceInfo",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      typeOfService: {
        _id: "$typeOfService._id",
        price: "$typeOfService.price",
        title: "$typeOfServiceInfo.title",
        description: "$typeOfServiceInfo.description",
      },
    },
  },
  {
    $group: {
      _id: "$_id",
      doc: { $first: "$$ROOT" },
      typeOfService: {
        $push: {
          $cond: [
            { $gt: ["$typeOfService._id", null] },
            "$typeOfService",
            "$$REMOVE",
          ],
        },
      },
    },
  },
  {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: ["$doc", { typeOfService: "$typeOfService" }],
      },
    },
  },
];

const typeOfTransportation_modeOfTransportation = () => [
  {
    $unwind: {
      path: "$typeOfTransportation",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $unwind: {
      path: "$modeOfTransportation",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: "transitinfos",
      let: {
        transportationId: "$typeOfTransportation._id",
        modeId: "$modeOfTransportation._id",
      },
      pipeline: [
        { $unwind: "$transportation" },
        {
          $match: {
            $expr: { $eq: ["$transportation._id", "$$transportationId"] },
          },
        },
        { $unwind: "$transportation.modes" },
        {
          $match: {
            $expr: { $eq: ["$transportation.modes._id", "$$modeId"] },
          },
        },
        {
          $project: {
            _id: 0,
            typeOfTransportation: {
              _id: "$transportation._id",
              title: "$transportation.title",
              description: "$transportation.description",
            },
            modeOfTransportation: {
              _id: "$transportation.modes._id",
              title: "$transportation.modes.title",
              description: "$transportation.modes.description",
            },
          },
        },
      ],
      as: "transportationInfo",
    },
  },
  {
    $unwind: {
      path: "$transportationInfo",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      enrichedTransportation: {
        _id: "$typeOfTransportation._id",
        price: "$typeOfTransportation.price",
        title: "$transportationInfo.typeOfTransportation.title",
        description: "$transportationInfo.typeOfTransportation.description",
      },
      enrichedMode: {
        _id: "$modeOfTransportation._id",
        price: "$modeOfTransportation.price",
        title: "$transportationInfo.modeOfTransportation.title",
        description: "$transportationInfo.modeOfTransportation.description",
      },
    },
  },
  {
    $group: {
      _id: "$_id",
      doc: { $first: "$$ROOT" },
      typeOfTransportation: {
        $addToSet: {
          $cond: [
            { $gt: ["$enrichedTransportation._id", null] },
            "$enrichedTransportation",
            "$$REMOVE",
          ],
        },
      },
      modeOfTransportation: {
        $addToSet: {
          $cond: [
            { $gt: ["$enrichedMode._id", null] },
            "$enrichedMode",
            "$$REMOVE",
          ],
        },
      },
    },
  },
  {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: [
          "$doc",
          {
            typeOfTransportation: "$typeOfTransportation",
            modeOfTransportation: "$modeOfTransportation",
          },
        ],
      },
    },
  },
  {
    $project: {
      enrichedTransportation: 0,
      enrichedMode: 0,
    },
  },
];

const port_BridgeOfCrossing = () => [
  {
    $unwind: {
      path: "$port_BridgeOfCrossing",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: "specialrequirements",
      let: { id: "$port_BridgeOfCrossing._id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$id"] },
          },
        },
        {
          $project: {
            _id: 0,
            post_bridge: 1,
          },
        },
      ],
      as: "bridgeInfo",
    },
  },
  {
    $unwind: {
      path: "$bridgeInfo",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      enrichedBridge: {
        _id: "$port_BridgeOfCrossing._id",
        price: "$port_BridgeOfCrossing.price",
        post_bridge: "$bridgeInfo.post_bridge",
      },
    },
  },
  {
    $group: {
      _id: "$_id",
      doc: { $first: "$$ROOT" },
      port_BridgeOfCrossing: {
        $push: {
          $cond: [
            { $gt: ["$enrichedBridge._id", null] },
            "$enrichedBridge",
            "$$REMOVE",
          ],
        },
      },
    },
  },
  {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: [
          "$doc",
          { port_BridgeOfCrossing: "$port_BridgeOfCrossing" },
        ],
      },
    },
  },
  {
    $project: {
      enrichedBridge: 0,
      bridgeInfo: 0,
    },
  },
];

const specialRequirements = () => [
  {
    $unwind: {
      path: "$specialRequirements",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: "specialrequirements",
      let: { reqId: "$specialRequirements._id" },
      pipeline: [
        { $unwind: "$requirements" },
        {
          $match: {
            $expr: { $eq: ["$requirements._id", "$$reqId"] },
          },
        },
        {
          $project: {
            _id: "$requirements._id",
            type: "$requirements.type",
          },
        },
      ],
      as: "matchedRequirement",
    },
  },
  {
    $unwind: {
      path: "$matchedRequirement",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      mergedRequirement: {
        _id: "$specialRequirements._id",
        price: "$specialRequirements.price",
        type: "$matchedRequirement.type",
      },
    },
  },
  {
    $group: {
      _id: "$_id",
      doc: { $first: "$$ROOT" },
      specialRequirements: {
        $push: {
          $cond: [
            { $gt: ["$mergedRequirement._id", null] },
            "$mergedRequirement",
            "$$REMOVE",
          ],
        },
      },
    },
  },
  {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: [
          "$doc",
          { specialRequirements: "$specialRequirements" },
        ],
      },
    },
  },
  {
    $project: {
      mergedRequirement: 0,
      matchedRequirement: 0,
    },
  },
];

module.exports = {
  fetchData,
  typeOfService,
  typeOfTransportation_modeOfTransportation,
  port_BridgeOfCrossing,
  specialRequirements,
};
