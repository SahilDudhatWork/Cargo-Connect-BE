const Rating = require("../../../model/movement/rating");
const Movement = require("../../../model/movement/movement");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const getRating = async (req, res) => {
  const { logger, params } = req;
  try {
    const { movementId } = params;
    const movementData = await Movement.findOne({ movementId: movementId });
    const getData = await Rating.findOne({
      movementId: movementData._id,
      type: req.role,
    });

    const statusCode = getData ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = getData ? INFO_MSGS.SUCCESS : ERROR_MSGS.DATA_NOT_AVAILABLE;
    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: getData || null,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  getRating,
};
