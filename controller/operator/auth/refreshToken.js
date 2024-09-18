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
    const accessToken = await commonAuth(encryptOperator);

    await Operator.findByIdAndUpdate(
      operatorId,
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
    console.log("refreshToken Error", error);
    return handleException(logger, res, error);
  }
};

// Common Auth function for 2FA checking and JWT token generation
const commonAuth = async (encryptOperator) => {
  try {
    const payload = {
      encryptOperator,
      expiresIn: process.env.OPERATOR_ACCESS_TIME,
      type: "Access",
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
    const { encryptOperator, expiresIn, type, role } = payload;
    const token = jwt.sign(
      { operatorId: encryptOperator, type, role },
      process.env.OPERATOR_ACCESS_TOKEN,
      { expiresIn }
    );
    return token;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  refreshToken,
};
