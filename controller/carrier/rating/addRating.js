const Rating = require("../../../model/movement/rating");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const addRating = async (req, res) => {
  const { logger, params, body } = req;
  try {
    body.movementId = params.movementId;

    const saveData = await Rating.create(body);

    const statusCode = saveData ? STATUS_CODE.CREATED : STATUS_CODE.BAD_REQUEST;
    const message = saveData
      ? INFO_MSGS.CREATED_SUCCESSFULLY
      : ERROR_MSGS.CREATE_ERR;
    return Response[statusCode === STATUS_CODE.CREATED ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: saveData || null,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  addRating,
};
