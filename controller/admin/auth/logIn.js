const Admin = require("../../../model/admin/admin");
const jwt = require("jsonwebtoken");
const { encrypt, decrypt } = require("../../../helper/encrypt-decrypt");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { handleException } = require("../../../helper/exception");
const LoginValidation = require("../../../helper/joi-validation");
require("dotenv").config();

/**
 * Generate JWT Token
 */
const generateJWTToken = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { encryptAdmin, expiresIn, type, role } = payload;
      const token = jwt.sign(
        { adminId: encryptAdmin, type, role },
        process.env.ADMIN_ACCESS_TOKEN,
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
  const { logger, body, headers, connection } = req;
  try {
    const { email, password } = body;

    const { error } = LoginValidation.adminLogin(body);
    if (error) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: error.details[0].message,
      };
      return Response.error(obj);
    }

    const adminInfo = await Admin.findOne({ email: email });

    if (!adminInfo) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_NOT_FOUND,
      };
      return Response.error(obj);
    }

    const decryptPassword = decrypt(
      adminInfo.password,
      process.env.PASSWORD_ENCRYPTION_KEY
    );

    if (password !== decryptPassword) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.INVALID_LOGIN,
      };
      return Response.error(obj);
    }
    let key1 = process.env.ADMIN_ENCRYPTION_KEY;
    const encryptAdmin = encrypt(adminInfo._id, key1);
    const clientIp = headers["x-forwarded-for"] || connection.remoteAddress;
    const data = await commonAuth(encryptAdmin, clientIp);

    await Admin.findByIdAndUpdate(
      adminInfo._id,
      {
        lastLogin: new Date(Date.now()),
        "token.token": data.accessToken,
        "token.type": "Access",
        "token.createdAt": new Date(Date.now()),
      },
      { new: true }
    );
    const obj = {
      res,
      msg: INFO_MSGS.SUCCESSFUL_LOGIN,
      status: STATUS_CODE.OK,
      data,
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
const commonAuth = (encryptAdmin, ip) =>
  new Promise(async (resolve, reject) => {
    try {
      const payload = {
        expiresIn: process.env.ADMIN_ACCESS_TIME,
        encryptAdmin,
        type: "Access",
        role: "Admin",
      };
      const accessToken = await generateJWTToken(payload);
      const data = {
        accessToken,
      };
      resolve(data);
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
