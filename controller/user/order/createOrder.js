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
    const movementId = await generateMovementId();

    body.userId = userId;
    body.movementId = movementId;

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
  createOrder,
};
