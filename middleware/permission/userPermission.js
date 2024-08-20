const Response = require("../../helper/response");
const User = require("../../model/user/user");
const { STATUS_CODE, ERROR_MSGS, INFO_MSGS } = require("../../helper/constant");
const { handleException } = require("../../helper/exception");

const userPermission = async (req, res, next) => {
  const { logger } = req;
  try {
    const getUser = await User.findById(req.userId);

    let { verifyByAdmin, isBlocked } = getUser;

    if (verifyByAdmin && !isBlocked) {
      return next();
    }

    if (verifyByAdmin && isBlocked) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCESS_RESTRICTED_ADMIN,
      };
      return Response.error(obj);
    }

    if (!verifyByAdmin && isBlocked) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCESS_RESTRICTED_ADMIN,
      };
      return Response.error(obj);
    }

    if (!verifyByAdmin && !isBlocked) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.INSUFFICIENT_PERMISSION,
      };
      return Response.error(obj);
    }
  } catch (error) {
    console.log("error--->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  userPermission,
};
