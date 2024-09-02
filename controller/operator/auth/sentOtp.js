const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { handleException } = require("../../../helper/exception");
const Otp = require("../../../model/common/otp");
const Operator = require("../../../model/operator/operator");

const sentOtp = async (req, res) => {
  const { logger } = req;
  try {
    const { mobile } = req.body;

    const checkMobileExist = await Operator.findOne({ operatorNumber: mobile });

    if (!checkMobileExist) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_NOT_FOUND,
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpData = { mobile, otp };

    await Otp.findOneAndDelete({ mobile });
    const saveData = await Otp.create(otpData);

    if (!saveData) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.WENT_WRONG,
      });
    }

    // Schedule OTP expiration
    setTimeout(
      async () => {
        await Otp.findOneAndDelete({ otp });
      },
      5 * 60 * 1000
    ); // 5 minutes

    return Response.success({
      res,
      status: STATUS_CODE.CREATED,
      msg: INFO_MSGS.OTP_SENT_IN_MOBILE_SUCC,
      data: { otp },
    });
  } catch (error) {
    console.error("Error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  sentOtp,
};
