const Operator = require("../../../model/operator/operator");
const Carrier = require("../../../model/carrier/carrier");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { paginationResponse } = require("../../../utils/paginationFormate");
const { ObjectId } = require("mongoose").Types;
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const fetchData = async (req, res) => {
  const { logger, carrierId, query } = req;
  try {
    let { page, limit, keyWord } = query;

    let getCarrier = await Carrier.findById(carrierId);

    let qry = {
      carrierId:
        getCarrier.parentId !== undefined && getCarrier.parentId !== null
          ? {
              $in: [new ObjectId(carrierId), getCarrier.parentId],
            }
          : new ObjectId(carrierId),
    };

    if (keyWord) {
      qry.$or = [
        { operatorName: { $regex: keyWord, $options: "i" } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: { $toLong: "$operatorNumber" } },
              regex: keyWord,
            },
          },
        },
      ];
    }

    offset = page || 1;
    limit = limit || 10;
    const skip = limit * (offset - 1);

    const getData = await Operator.aggregate([
      { $match: qry },
      {
        $addFields: {
          statusOrder: {
            $cond: { if: { $eq: ["$status", "Active"] }, then: 0, else: 1 },
          },
        },
      },
      { $sort: { statusOrder: 1, createdAt: -1 } },
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
                statusOrder: 0,
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

module.exports = {
  fetchData,
};
