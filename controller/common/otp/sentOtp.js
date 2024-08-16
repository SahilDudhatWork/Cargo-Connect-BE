const Otp = require("../../../model/common/otp");
const User = require("../../../model/user/user");
const Carrier = require("../../../model/carrier/carrier");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { handleException } = require("../../../helper/exception");
const { VerificationEmail } = require("../../../utils/emailVerification");

const sentOtp = async (req, res) => {
  const { logger } = req;
  try {
    const { email, type } = req.body;

    let Model;
    if (type === "user") {
      Model = User;
    } else if (type === "carrier") {
      Model = Carrier;
    }

    const checkEmailExists = await Model.aggregate([
      { $match: { email: email } },
    ]);
    if (checkEmailExists.length === 0) {
      let obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_NOT_FOUND,
      };
      return Response.error(obj);
    }

    let otp = Math.floor(100000 + Math.random() * 900000);
    var otpData = {
      email,
      otp,
    };
    await VerificationEmail(email, otp);

    //Handle success
    await Otp.findOneAndDelete({ email: email });
    let saveData = await Otp.create(otpData);
    if (!saveData) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.WENT_WRONG,
      };
      return Response.error(obj);
    }
    setTimeout(
      async () => {
        await Otp.findOneAndDelete({
          otp,
        });
      },
      5 * 60 * 1000
    );
    const obj = {
      res,
      status: STATUS_CODE.CREATED,
      msg: INFO_MSGS.OTP_SENT_SUCC,
    };
    return Response.success(obj);
  } catch (error) {
    console.log("error--->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  sentOtp,
};
