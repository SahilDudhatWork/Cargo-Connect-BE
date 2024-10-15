const Operator = require("../../../model/operator/operator");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const update = async (req, res) => {
  const { logger, operatorId, body } = req;
  try {
    const { carrierId, accountId } = body;

    if (accountId || carrierId) {
      const errorMsg = accountId
        ? `carrierId ${ERROR_MSGS.NOT_EDITABLE}`
        : `accountId ${ERROR_MSGS.NOT_EDITABLE}`;
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: errorMsg,
      });
    }

    const updateData = await Operator.findByIdAndUpdate(
      { _id: new ObjectId(operatorId) },
      body,
      { new: true }
    );

    const result = updateData.toObject();
    delete result.password;
    delete result.token;
    delete result.__v;

    const statusCode = updateData ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = updateData
      ? INFO_MSGS.UPDATED_SUCCESSFULLY
      : ERROR_MSGS.UPDATE_ERR;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: result,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  update,
};
