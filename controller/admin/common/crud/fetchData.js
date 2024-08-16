const { handleException } = require("../../../../helper/exception");
const Response = require("../../../../helper/response");
const { paginationResponse } = require("../../../../utils/paginationFormate")
const { hendleModel } = require("../../../../utils/hendleModel");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../../helper/constant");

const fetchData = async (req, res) => {
  let { logger } = req;
  try {
    let { keyWord, page, limit, sortBy } = req.query;
    const { type } = req.params;

    const Model = await hendleModel(res, type);
    let qry = {};
    
    if (keyWord) {
      qry = {
        $or: [
          { companyName: { $regex: keyWord, $options: "i" } },
          { contactName: { $regex: keyWord, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: { $toLong: "$contactNumber" } },
                regex: keyWord,
              },
            },
          },
        ],
      };
    }

    sortBy = sortBy === "recent" ? { createdAt: -1 } : { createdAt: 1 };

    offset = page || 1;
    limit = limit || 10;
    const skip = limit * (offset - 1);
    const getData = await Model.aggregate([
      { $match: qry },
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
