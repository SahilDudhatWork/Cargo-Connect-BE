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

const fetchOrder = async (req, res) => {
  let { logger, userId } = req;
  try {
    let { page, limit, status } = req.query;

    offset = page || 1;
    limit = limit || 10;
    const skip = limit * (offset - 1);
    const getData = await Movement.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
          status: status,
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

const generateMovementId = () => {
  const prefixLength = 10;
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let dynamicPrefix = "";

  for (let i = 0; i < prefixLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    dynamicPrefix += characters[randomIndex];
  }

  const uniqueNumber = Date.now().toString().slice(-10);

  const uniqueId = `${dynamicPrefix}${uniqueNumber}`;
  return uniqueId;
};

module.exports = {
  fetchOrder,
};
