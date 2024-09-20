const Operator = require("../../../model/operator/operator");
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
  const { logger, operatorId } = req;
  try {
    const operatorInfo = await Operator.findById({ _id: operatorId });
    if (!operatorInfo) {
      let obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_NOT_FOUND,
      };
      return Response.error(obj);
    }

    const encryptOperator = encrypt(
      operatorId,
      process.env.OPERATOR_ENCRYPTION_KEY
    );
    const accessToken = await commonAuth(
      encryptOperator,
      process.env.OPERATOR_ACCESS_TIME,
      process.env.OPERATOR_ACCESS_TOKEN,
      "Access"
    );

    const refreshToken = await commonAuth(
      encryptOperator,
      process.env.REFRESH_TOKEN_TIME,
      process.env.REFRESH_ACCESS_TOKEN,
      "Refresh"
    );

    await Operator.findByIdAndUpdate(
      operatorId,
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
const commonAuth = async (encryptOperator, ACCESS_TIME, ACCESS_TOKEN, type) => {
  try {
    const payload = {
      encryptOperator,
      expiresIn: ACCESS_TIME,
      accessToken: ACCESS_TOKEN,
      type,
      role: "Operator",
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
    const { encryptOperator, expiresIn, accessToken, type, role } = payload;
    const token = jwt.sign(
      { operatorId: encryptOperator, type, role },
      accessToken,
      {
        expiresIn,
      }
    );
    return token;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  refreshToken,
};
