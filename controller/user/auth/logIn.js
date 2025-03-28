const User = require("../../../model/user/user");
const Otp = require("../../../model/common/otp");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { decrypt } = require("../../../helper/encrypt-decrypt");
const { handleException } = require("../../../helper/exception");
const { VerificationEmail } = require("../../../utils/nodemailer");
require("dotenv").config();

// Login
const logIn = async (req, res) => {
  const { logger, body } = req;
  try {
    const { email, password, deviceToken, webToken } = body;

    let userInfo = await User.aggregate([{ $match: { email: email } }]);
    userInfo = userInfo[0];
    if (!userInfo) {
      let obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_NOT_FOUND,
      };
      return Response.error(obj);
    }

    const decryptPassword = decrypt(
      userInfo.password,
      process.env.PASSWORD_ENCRYPTION_KEY
    );

    if (password !== decryptPassword) {
      let obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.INVALID_LOGIN,
      };
      return Response.error(obj);
    }

    await User.findByIdAndUpdate(
      { _id: userInfo._id },
      { deviceToken, webToken },
      { new: true }
    );

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
    console.log("Login Error : ", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  logIn,
};
