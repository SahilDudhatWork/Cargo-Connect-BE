const Vehicle = require("../../../model/vehicle/vehicle");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const { paginationResponse } = require("../../../utils/paginationFormate");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const fetchData = async (req, res) => {
  let { logger, carrierId, query } = req;
  try {
    let { page, limit, sortBy } = query;

    sortBy = sortBy === "recent" ? { createdAt: -1 } : { createdAt: 1 };

    offset = page || 1;
    limit = limit || 10;
    const skip = limit * (offset - 1);
    const getData = await Vehicle.aggregate([
      { $match: { carrierId: new ObjectId(carrierId) } },
      { $sort: sortBy },
      {
        $facet: {
          paginatedResult: [
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
              $project: {
                __v: 0,
                password: 0,
                forgotPassword: 0,
                token: 0,
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
      data:
        response.response.length > 0
          ? { Response: response }
          : { Response: [] },
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  fetchData,
};
