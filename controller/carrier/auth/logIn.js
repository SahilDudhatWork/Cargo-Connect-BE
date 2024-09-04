const Carrier = require("../../../model/carrier/carrier");
const jwt = require("jsonwebtoken");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { encrypt, decrypt } = require("../../../helper/encrypt-decrypt");
const { handleException } = require("../../../helper/exception");
require("dotenv").config();

/**
 * Generate JWT Token
 */
const generateJWTToken = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { encryptCarrier, expiresIn, type, role } = payload;
      const token = jwt.sign(
        { carrierId: encryptCarrier, type, role },
        process.env.CARRIER_ACCESS_TOKEN,
        { expiresIn }
      );
      resolve(token);
    } catch (error) {
      reject(error.message);
    }
  });
};

/**
 * Login
 */
const logIn = async (req, res) => {
  const { logger, body } = req;
  try {
    const { email, password } = body;

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

    const encryptCarrier = encrypt(
      carrierInfo._id,
      process.env.CARRIER_ENCRYPTION_KEY
    );
    const accessToken = await commonAuth(encryptCarrier);

    await Carrier.findByIdAndUpdate(
      carrierInfo._id,
      {
        lastLogin: new Date(),
        "token.token": accessToken,
        "token.type": "Access",
        "token.createdAt": new Date(),
      },
      { new: true }
    );

    let obj = {
      res,
      msg: INFO_MSGS.SUCCESSFUL_LOGIN,
      status: STATUS_CODE.OK,
      data: { accessToken },
    };
    return Response.success(obj);
  } catch (error) {
    console.log("Login Error : ", error);
    return handleException(logger, res, error);
  }
};

/**
 * Common Auth function for 2FA checking and JWT token generation
 */
const commonAuth = (encryptCarrier) =>
  new Promise(async (resolve, reject) => {
    try {
      const payload = {
        expiresIn: process.env.CARRIER_ACCESS_TIME,
        encryptCarrier,
        type: "Access",
        role: "Carrier",
      };
      const accessToken = await generateJWTToken(payload);

      resolve(accessToken);
    } catch (error) {
      console.log("common Auth Log :", error);
      reject(error);
    }
  });

module.exports = {
  logIn,
  generateJWTToken,
  commonAuth,
};
