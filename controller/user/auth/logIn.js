const User = require("../../../model/user/user");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { decrypt } = require("../../../helper/encrypt-decrypt");
const { handleException } = require("../../../helper/exception");
const tokenGenerate = require("../../../utils/jwt");
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

    const { accessToken, refreshToken } = await tokenGenerate(
      userInfo._id,
      "User",
      deviceToken,
      webToken
    );

    return Response.success({
      res,
      status: STATUS_CODE.CREATED,
      msg: INFO_MSGS.SUCCESSFUL_LOGIN,
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    console.log("Login Error : ", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  logIn,
};
