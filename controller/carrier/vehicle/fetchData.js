const Vehicle = require("../../../model/vehicle/vehicle");
const Carrier = require("../../../model/carrier/carrier");
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
  const { logger, carrierId, query } = req;
  try {
    let { page, limit, sortBy, keyWord } = query;

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
      qry.$or = [{ vehicleName: { $regex: keyWord, $options: "i" } }];
    }

    if (sortBy === "active") {
      qry.status = "Active";
    } else if (sortBy === "deactive") {
      qry.status = "Deactive";
    }

    offset = page || 1;
    limit = limit || 10;
    const skip = limit * (offset - 1);

    const getData = await Vehicle.aggregate([
      { $match: qry },
      { $sort: { createdAt: -1 } },
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
      data: response,
    });
  } catch (error) {
    return handleException(logger, res, error);
  }
};

module.exports = {
  fetchData,
};
