const Movement = require("../../../model/movement/movement");
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

    let matchCriteria = {
      userId: new ObjectId(userId),
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
