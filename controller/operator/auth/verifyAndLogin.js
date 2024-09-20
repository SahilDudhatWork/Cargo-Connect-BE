const Otp = require("../../../model/common/otp");
const Operator = require("../../../model/operator/operator");
const Response = require("../../../helper/response");
const jwt = require("jsonwebtoken");
const { encrypt, decrypt } = require("../../../helper/encrypt-decrypt");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const { handleException } = require("../../../helper/exception");

const verifyAndLogin = async (req, res) => {
  const { logger, body } = req;
  try {
    const { mobile, otp } = body;

    const otpData = await Otp.findOne({ mobile });

    if (!otpData || otpData?.otp !== otp) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.INVALID_OTP,
      };
      return Response.error(obj);
    }

    const currentTime = new Date();
    const createdAtTime = new Date(otpData.createdAt);
    const timeDifferenceMinutes = (currentTime - createdAtTime) / (1000 * 60);

    if (timeDifferenceMinutes > 5) {
      // OTP has expired
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.EXPIRED_OTP,
      };
      return Response.error(obj);
    }

    const operatorInfo = await Operator.findOne({ operatorNumber: mobile });

    const encryptOperator = encrypt(
      operatorInfo._id,
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
      operatorInfo._id,
      {
        lastLogin: new Date(),
        "token.accessToken": accessToken,
        "token.refreshToken": refreshToken,
        "token.type": "Access",
        "token.createdAt": new Date(),
      },
      { new: true }
    );

    await Otp.findOneAndDelete({ mobile, otp });
    const obj = {
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.OTP_VERIFIED,
      data: {
        accessToken,
        refreshToken,
      },
    };
    return Response.success(obj);
  } catch (error) {
    console.log("error--->", error);
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
  verifyAndLogin,
};
