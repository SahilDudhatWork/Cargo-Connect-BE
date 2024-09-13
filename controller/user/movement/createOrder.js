const Movement = require("../../../model/movement/movement");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const createOrder = async (req, res) => {
  let { logger, userId, body } = req;
  try {
    body.userId = userId;

    const saveData = await Movement.create(body);

    const statusCode = saveData ? STATUS_CODE.CREATED : STATUS_CODE.CREATED;
    const message = saveData
      ? INFO_MSGS.SEND_USER_TO_CARRIER_REQUEST
      : ERROR_MSGS.CREATE_ERR;
    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: saveData,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  createOrder,
};
