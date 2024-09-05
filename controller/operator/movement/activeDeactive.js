const Operator = require("../../../model/operator/operator");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const activeDeactive = async (req, res) => {
  const { logger, operatorId, body } = req;
  try {
    const saveData = await Operator.findByIdAndUpdate(operatorId, body, {
      new: true,
    });
    const statusCode = saveData ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = saveData ? INFO_MSGS.SUCCESS : ERROR_MSGS.BAD_REQUEST;
    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  activeDeactive,
};
