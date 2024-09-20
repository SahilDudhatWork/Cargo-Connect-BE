const User = require("../../../model/user/user");
const jwt = require("jsonwebtoken");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { encrypt } = require("../../../helper/encrypt-decrypt");
const {
  STATUS_CODE,
  INFO_MSGS,
  ERROR_MSGS,
} = require("../../../helper/constant");

const refreshToken = async (req, res) => {
  const { logger, userId } = req;
  try {
    const userInfo = await User.findById({ _id: userId });
    if (!userInfo) {
      let obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_NOT_FOUND,
      };
      return Response.error(obj);
    }

    const encryptUser = encrypt(userId, process.env.USER_ENCRYPTION_KEY);
    const accessToken = await commonAuth(
      encryptUser,
      process.env.USER_ACCESS_TIME,
      process.env.USER_ACCESS_TOKEN,
      "Access"
    );
    const refreshToken = await commonAuth(
      encryptUser,
      process.env.REFRESH_TOKEN_TIME,
      process.env.REFRESH_ACCESS_TOKEN,
      "Refresh"
    );

    await User.findByIdAndUpdate(
      userId,
      {
        lastLogin: new Date(),
        "token.accessToken": accessToken,
        "token.refreshToken": refreshToken,
        "token.type": "Access",
        "token.createdAt": new Date(),
      },
      { new: true }
    );

    let obj = {
      res,
      msg: INFO_MSGS.SUCCESSFUL_LOGIN,
      status: STATUS_CODE.OK,
      data: { accessToken, refreshToken },
    };
    return Response.success(obj);
  } catch (error) {
    console.log("refreshToken Error", error);
    return handleException(logger, res, error);
  }
};

// Common Auth function for 2FA checking and JWT token generation
const commonAuth = async (encryptUser, ACCESS_TIME, ACCESS_TOKEN, type) => {
  try {
    const payload = {
      encryptUser,
      expiresIn: ACCESS_TIME,
      accessToken: ACCESS_TOKEN,
      type,
      role: "User",
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
    const { encryptUser, expiresIn, accessToken, type, role } = payload;
    const token = jwt.sign({ userId: encryptUser, type, role }, accessToken, {
      expiresIn,
    });
    return token;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  refreshToken,
};
