const Operator = require("../../../model/operator/operator");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { mobileVerification } = require("../../../helper/joi-validation");
const { generateAccountId } = require("../../../utils/generateUniqueId");

const create = async (req, res) => {
  const { logger, body } = req;
  try {
    const { operatorNumber, carrierId } = body;
    body.accountId = generateAccountId();

    const { error } = mobileVerification({
      mobile: operatorNumber,
    });
    if (error) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: error.details[0].message,
      };
      return Response.error(obj);
    }
    if (!carrierId) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: `carrierId ${ERROR_MSGS.KEY_REQUIRED}`,
      };
      return Response.error(obj);
    }
    const checkMobileExist = await Operator.findOne({ operatorNumber });
    if (checkMobileExist) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.OPERATOR_MOB_NUM_EXISTS,
      };
      return Response.error(obj);
    }

    let saveData = await Operator.create(body);

    const statusCode = saveData ? STATUS_CODE.CREATED : STATUS_CODE.BAD_REQUEST;
    const message = saveData
      ? INFO_MSGS.CREATED_SUCCESSFULLY
      : ERROR_MSGS.CREATE_ERR;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
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
  create,
};
