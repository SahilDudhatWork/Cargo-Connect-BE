const Response = require("../../helper/response");
const Carrier = require("../../model/carrier/carrier");
const { STATUS_CODE, ERROR_MSGS, INFO_MSGS } = require("../../helper/constant");
const { handleException } = require("../../helper/exception");

const carrierPermission = async (req, res, next) => {
  const { logger, carrierId } = req;
  try {
    const getCarrier = await Carrier.findById(carrierId);

    let { verifyByAdmin, isBlocked } = getCarrier;

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
  carrierPermission,
};
