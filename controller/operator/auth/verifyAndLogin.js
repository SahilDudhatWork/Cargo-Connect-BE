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
  const { logger } = req;
  try {
    const { mobile, otp } = req.body;

    const otpData = await Otp.findOne({ mobile });

    if (!otpData) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.DATA_NOT_FOUND,
      };
      return Response.error(obj);
    }

    if (otpData.otp !== otp) {
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

    const encryptCarrier = encrypt(
      operatorInfo._id,
      process.env.OPERATOR_ENCRYPTION_KEY
    );
    const accessToken = await commonAuth(encryptCarrier);

    await Operator.findByIdAndUpdate(
      operatorInfo._id,
      {
        lastLogin: new Date(),
        "token.token": accessToken,
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
      },
    };
    return Response.success(obj);
  } catch (error) {
    console.log("error--->", error);
    return handleException(logger, res, error);
  }
};

/**
 * Generate JWT Token
 */
const generateJWTToken = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { encryptOperator, expiresIn, type, role } = payload;
      const token = jwt.sign(
        { operatorId: encryptOperator, type, role },
        process.env.OPERATOR_ACCESS_TOKEN,
        { expiresIn }
      );
      resolve(token);
    } catch (error) {
      reject(error.message);
    }
  });
};

/**
 * Common Auth function for 2FA checking and JWT token generation
 */
const commonAuth = (encryptOperator) =>
  new Promise(async (resolve, reject) => {
    try {
      const payload = {
        expiresIn: process.env.OPERATOR_ACCESS_TIME,
        encryptOperator,
        type: "Access",
        role: "Operator",
      };
      const accessToken = await generateJWTToken(payload);

      resolve(accessToken);
    } catch (error) {
      console.log("common Auth Log :", error);
      reject(error);
    }
  });

module.exports = {
  verifyAndLogin,
};
