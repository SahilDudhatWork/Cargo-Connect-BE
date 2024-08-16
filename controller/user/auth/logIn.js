const User = require("../../../model/user/user");
const jwt = require("jsonwebtoken");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { encrypt, decrypt } = require("../../../helper/encrypt-decrypt");
const { handleException } = require("../../../helper/exception");
const {
  emailAndPasswordVerification,
} = require("../../../helper/joi-validation");
require("dotenv").config();

/**
 * Generate JWT Token
 */
const generateJWTToken = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { encryptUser, expiresIn, type, role } = payload;
      const token = jwt.sign(
        { userId: encryptUser, type, role },
        process.env.USER_ACCESS_TOKEN,
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
  const { logger } = req;
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const message = !email
        ? `Email ${ERROR_MSGS.KEY_REQUIRED}`
        : `Password ${ERROR_MSGS.KEY_REQUIRED}`;
      let obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: message,
      };
      return Response.error(obj);
    }

    const { error } = emailAndPasswordVerification({
      email,
      password,
    });
    if (error) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: error.details[0].message,
      };
      return Response.error(obj);
    }

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

    const encryptUser = encrypt(userInfo._id, process.env.USER_ENCRYPTION_KEY);
    const accessToken = await commonAuth(encryptUser);

    await User.findByIdAndUpdate(
      userInfo._id,
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
const commonAuth = (encryptUser) =>
  new Promise(async (resolve, reject) => {
    try {
      const payload = {
        expiresIn: process.env.USER_ACCESS_TIME,
        encryptUser,
        type: "Access",
        role: "User",
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
