const Movement = require("../../../model/user/movement");
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
  let { logger } = req;
  try {
    let { page, limit, keyWord } = req.query;

    let qry = {};

    if (keyWord) {
      qry = {
        $or: [{ movementId: { $regex: keyWord, $options: "i" } }],
      };
    }

    offset = page || 1;
    limit = limit || 10;
    const skip = limit * (offset - 1);
    const getData = await Movement.aggregate([
      { $match: qry },
      {
        $lookup: {
          let: { operatorId: "$operatorId" },
          from: "operators",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$operatorId"] },
              },
            },
            // { $project: { _id: 1, operatorNumber: 1, operatorName: 1 } },
          ],
          as: "operatorsData",
        },
      },
      {
        $unwind: {
          path: "$operatorsData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          let: { vehicleId: "$vehicleId" },
          from: "vehicles",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$vehicleId"] },
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
  fetchMovement,
};
