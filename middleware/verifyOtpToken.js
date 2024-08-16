const Response = require("../helper/response");
const { STATUS_CODE, ERROR_MSGS, INFO_MSGS } = require("../helper/constant");
const jwt = require("jsonwebtoken");
const { handleException } = require("../helper/exception");

const verifyOtpToken = async (req, res, next) => {
  const { logger } = req;
  try {
    let { otpToken, email } = req.body;
    if (!otpToken) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: `otpToken ${INFO_MSGS.MSG_REQUIRED}`,
      };
      return Response.error(obj);
    } else {
      jwt.verify(otpToken, process.env.USER_OTP_TOKEN, (err, payload) => {
        if (err) {
          const obj = {
            res,
            status: STATUS_CODE.UN_AUTHORIZED,
            msg: ERROR_MSGS.UN_AUTHORIZED,
          };
          return Response.error(obj);
        } else {
          if (payload.email != email) {
            const obj = {
              res,
              status: STATUS_CODE.BAD_REQUEST,
              msg: ERROR_MSGS.BAD_REQUEST,
            };
            return Response.error(obj);
          }
          req.email = payload.email;
          next();
        }
      });
    }
  } catch (error) {
    console.log("error--->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  verifyOtpToken,
};
