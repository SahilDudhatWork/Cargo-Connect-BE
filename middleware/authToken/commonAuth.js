const { userAuth } = require("./userAuth");
const { carrierAuth } = require("./carrierAuth");
const { adminAuth } = require("./adminAuth");
const { operatorAuth } = require("./operatorAuth");
const Response = require("../../helper/response");
const { handleException } = require("../../helper/exception");
const { STATUS_CODE, ERROR_MSGS } = require("../../helper/constant");

const cmnAuth = async (req, res, next) => {
  try {
    const { type } = req.params;
    if (type === "user") {
      return userAuth(req, res, next);
    }
    if (type === "carrier") {
      return carrierAuth(req, res, next);
    }
    if (type === "admin") {
      return adminAuth(req, res, next);
    }
    if (type === "operator") {
      return operatorAuth(req, res, next);
    }

    return Response.error({
      res,
      status: STATUS_CODE.BAD_REQUEST,
      msg: ERROR_MSGS.AUTHORIZATION_FAILED,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return handleException(req.logger, res, error);
  }
};

module.exports = { cmnAuth };
