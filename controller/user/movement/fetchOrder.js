const Movement = require("../../../model/movement/movement");
const User = require("../../../model/user/user");
const { handleException } = require("../../../helper/exception");
const { paginationResponse } = require("../../../utils/paginationFormate");
const { ObjectId } = require("mongoose").Types;
const {
  getTypeOfService_TypeOfTransportation_Pipeline,
  fetchVehicles_Pipeline,
  addresses_Pipeline,
  operators_Pipeline,
  port_BridgeOfCrossing_Pipeline,
  specialrequirements_Pipeline,
  users_Pipeline,
  carrier_Pipeline,
  ratting_Pipeline,
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

    const fetchSubUser = await User.findById(userId);
    const matchConditions = [
      { _id: new ObjectId(userId) },
      { parentId: new ObjectId(userId) },
      ...(fetchSubUser?.parentId
        ? [{ parentId: new ObjectId(fetchSubUser.parentId) }]
        : []),
    ];

    const getUser = await User.aggregate([
      {
        $match: {
          $or: matchConditions,
        },
      },
      {
        $project: {
          _id: 1,
          parentId: 1,
        },
      },
    ]);
    const userIds = Array.from(
      getUser.reduce((acc, user) => {
        acc.add(user._id.toString());
        if (user.parentId) {
          acc.add(user.parentId.toString());
        }
        return acc;
      }, new Set())
    ).map((id) => new ObjectId(id));

    let matchCriteria = {
      userId: {
        $in: userIds,
      },
    };

    if (status === "Pending") {
      matchCriteria.status = { $in: ["Pending", "NewAssignments"] };
    } else {
      matchCriteria.status = status;
    }

    const getData = await Movement.aggregate([
      {
        $match: matchCriteria,
      },
      { $sort: { createdAt: -1 } },
      ...getTypeOfService_TypeOfTransportation_Pipeline(),
      ...fetchVehicles_Pipeline(),
      ...addresses_Pipeline(),
      ...operators_Pipeline(),
      ...port_BridgeOfCrossing_Pipeline(),
      ...specialrequirements_Pipeline(),
      ...users_Pipeline(),
      ...carrier_Pipeline(),
      ...ratting_Pipeline(),
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
