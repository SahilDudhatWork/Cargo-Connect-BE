const Otp = require("../../../model/common/otp");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { handleException } = require("../../../helper/exception");
const { VerificationEmail } = require("../../../utils/emailVerification");
const { hendleModel } = require("../../../utils/hendleModel");

const sentOtp = async (req, res) => {
  const { logger, params, body } = req;
  try {
    const { email } = body;
    const { type } = params;

    const Model = await hendleModel(type);

    const checkEmailExists = await Model.exists({ email });

    if (!checkEmailExists) {
      if (type === "admin") {
        return Response.error({
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: ERROR_MSGS.PERMISSIONS_DENIED,
        });
      }
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_NOT_FOUND,
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpData = { email, otp };

    // Send OTP to email
    await VerificationEmail(email, otp);

    await Otp.findOneAndDelete({ email });
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
      msg: INFO_MSGS.OTP_SENT_SUCC,
    });
  } catch (error) {
    console.error("Error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  sentOtp,
};
