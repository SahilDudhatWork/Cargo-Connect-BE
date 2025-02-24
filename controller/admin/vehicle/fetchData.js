const Vehicle = require("../../../model/vehicle/vehicle");
const Carrier = require("../../../model/carrier/carrier");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { paginationResponse } = require("../../../utils/paginationFormate");
const { findOne } = require("../../../utils/helper");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const fetchData = async (req, res) => {
  const { logger, params, query } = req;
  try {
    const { carrierId } = params;
    let { page, limit, keyWord } = query;
    const actId = parseInt(carrierId);

    const fetchCarrier = await findOne(actId, Carrier);
    if (!fetchCarrier) {
      return Response.success({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.DATA_NOT_AVAILABLE,
      });
    }

    let qry = { carrierId: fetchCarrier._id };

    if (keyWord) {
      qry.$or = [{ vehicleName: { $regex: keyWord, $options: "i" } }];
    }

    offset = page || 1;
    limit = limit || 10;
    const skip = limit * (offset - 1);

    const getData = await Vehicle.aggregate([
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
