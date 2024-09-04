const Otp = require("../../../model/common/otp");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const jwt = require("jsonwebtoken");
const { handleException } = require("../../../helper/exception");

const verifyOtp = async (req, res) => {
  const { logger, body } = req;
  try {
    const { email, otp } = body;

    const otpData = await Otp.findOne({ email });

    if (!otpData) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.DATA_NOT_FOUND,
      };
      return Response.error(obj);
    }

    if (otpData.otp !== otp) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.INVALID_OTP,
      };
      return Response.error(obj);
    }

    const currentTime = new Date();
    const createdAtTime = new Date(otpData.createdAt);
    const timeDifferenceMinutes = (currentTime - createdAtTime) / (1000 * 60);

    if (timeDifferenceMinutes > 5) {
      // OTP has expired
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.EXPIRED_OTP,
      };
      return Response.error(obj);
    }
    let token = jwt.sign({ email }, process.env.USER_OTP_TOKEN, {
      expiresIn: process.env.USER_OTP_ACCESS_TIME,
    });
    if (!token) {
      const obj = {
        res,
        status: STATUS_CODE.INTERNAL_SERVER_ERROR,
        msg: ERROR_MSGS.INTERNAL_SERVER_ERROR,
      };
      return Response.error(obj);
    }
    await Otp.findOneAndDelete({ email, otp });
    const obj = {
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.OTP_VERIFIED,
      data: {
        token,
      },
    };
    return Response.success(obj);
  } catch (error) {
    console.log("error--->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  verifyOtp,
};
