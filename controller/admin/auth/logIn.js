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
 * Login
 */
const logIn = async (req, res) => {
  const { logger, body } = req;
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
    const encryptAdmin = encrypt(
      adminInfo._id,
      process.env.ADMIN_ENCRYPTION_KEY
    );
    const accessToken = await commonAuth(
      encryptAdmin,
      process.env.ADMIN_ACCESS_TIME,
      process.env.ADMIN_ACCESS_TOKEN,
      "Access"
    );
    const refreshToken = await commonAuth(
      encryptAdmin,
      process.env.REFRESH_TOKEN_TIME,
      process.env.REFRESH_ACCESS_TOKEN,
      "Refresh"
    );

    await Admin.findByIdAndUpdate(
      adminInfo._id,
      {
        lastLogin: new Date(Date.now()),
        "token.token": accessToken,
        "token.type": "Access",
        "token.createdAt": new Date(Date.now()),
      },
      { new: true }
    );
    const obj = {
      res,
      msg: INFO_MSGS.SUCCESSFUL_LOGIN,
      status: STATUS_CODE.OK,
      data: {
        accessToken,
        refreshToken,
      },
    };
    return Response.success(obj);
  } catch (error) {
    console.log("Login Error : ", error);
    return handleException(logger, res, error);
  }
};

// Common Auth function for 2FA checking and JWT token generation
const commonAuth = async (encryptAdmin, ACCESS_TIME, ACCESS_TOKEN, type) => {
  try {
    const payload = {
      encryptAdmin,
      expiresIn: ACCESS_TIME,
      accessToken: ACCESS_TOKEN,
      type,
      role: "Admin",
    };
    const accessToken = await generateJWTToken(payload);
    return accessToken;
  } catch (error) {
    console.log("commonAuth Error:", error);
    throw error;
  }
};

// Generate JWT Token
const generateJWTToken = async (payload) => {
  try {
    const { encryptAdmin, expiresIn, accessToken, type, role } = payload;
    const token = jwt.sign({ adminId: encryptAdmin, type, role }, accessToken, {
      expiresIn,
    });
    return token;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  logIn,
};
