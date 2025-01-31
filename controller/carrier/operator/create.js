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
  const { logger, carrierId, body } = req;
  try {
    const { operatorNumber } = body;
    body.accountId = generateAccountId();
    body.carrierId = carrierId;

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
    const checkMobileExist = await Operator.findOne({
      operatorNumber,
      status: "Active",
    });

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
