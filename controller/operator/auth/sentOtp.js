const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { handleException } = require("../../../helper/exception");
const Otp = require("../../../model/common/otp");
const Operator = require("../../../model/operator/operator");
const twilioSendOtp = require("../../../utils/twilioOtp");

const sentOtp = async (req, res) => {
  const { logger, body } = req;
  try {
    let { operatorNumber, countryCode } = body;

    countryCode = countryCode.toString();
    operatorNumber = operatorNumber.toString();
    let mobileNumber = `+${countryCode + operatorNumber}`;
    let newMobileNumber = `${countryCode + operatorNumber}`;

    await Otp.deleteMany({ mobile: newMobileNumber });

    const checkMobileExist = await Operator.findOne({
      operatorNumber,
      countryCode,
    });
    if (!checkMobileExist) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_NOT_FOUND,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const twilioResult = await twilioSendOtp(mobileNumber, otp);

    // if (!twilioResult.success) {
    //   return Response.error({
    //     res,
    //     status: STATUS_CODE.INTERNAL_SERVER_ERROR,
    //     msg: twilioResult.error,
    //   });
    // }

    const otpData = { mobile: newMobileNumber, otp };
    await Otp.create(otpData);

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
