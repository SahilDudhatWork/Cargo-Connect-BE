const Carrier = require("../../../model/carrier/carrier");
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

const logIn = async (req, res) => {
  const { logger, body } = req;
  try {
    const { email, password, deviceToken, webToken } = body;

    let carrierInfo = await Carrier.aggregate([{ $match: { email: email } }]);
    carrierInfo = carrierInfo[0];
    if (!carrierInfo) {
      let obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_NOT_FOUND,
      };
      return Response.error(obj);
    }

    const decryptPassword = decrypt(
      carrierInfo.password,
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
      carrierInfo._id,
      "Carrier",
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
