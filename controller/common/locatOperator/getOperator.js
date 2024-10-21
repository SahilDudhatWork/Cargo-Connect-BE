const Operator = require("../../../model/operator/operator");
const Response = require("../../../helper/response");
const { handleException } = require("../../../helper/exception");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const locatOperator = async (req, res) => {
  const { logger, params } = req;
  try {
    const { operatorAccountId } = params;
    let getData = await Operator.findOne(
      { accountId: operatorAccountId },
      { token: 0, __v: 0, createdAt: 0, updatedAt: 0 }
    );

    const statusCode = getData ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message = getData ? INFO_MSGS.SUCCESS : ERROR_MSGS.DATA_NOT_FOUND;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: getData,
    });
  } catch (error) {
    console.error("Error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  locatOperator,
};
