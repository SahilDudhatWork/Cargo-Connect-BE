const Otp = require("../../../model/common/otp");
const User = require("../../../model/user/user");
const Response = require("../../../helper/response");
const jwt = require("jsonwebtoken");
const { hendleModel } = require("../../../utils/hendleModel");
const { handleException } = require("../../../helper/exception");
const { encrypt } = require("../../../helper/encrypt-decrypt");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const verifyLoginOtp = async (req, res) => {
  const { logger, body, params } = req;
  try {
    const { email, otp } = body;
    const { type } = params;
    let ENCRYPTION_KEY;
    let ACCESS_TOKEN;
    let ACCESS_TIME;

    if (type === "user") {
      ENCRYPTION_KEY = process.env.USER_ENCRYPTION_KEY;
      ACCESS_TOKEN = process.env.USER_ACCESS_TOKEN;
      ACCESS_TIME = process.env.USER_ACCESS_TIME;
      tokenId = "userId";
    } else if (type === "carrier") {
      ENCRYPTION_KEY = process.env.CARRIER_ENCRYPTION_KEY;
      ACCESS_TOKEN = process.env.CARRIER_ACCESS_TOKEN;
      ACCESS_TIME = process.env.CARRIER_ACCESS_TIME;
      tokenId = "carrierId";
    }

    const Model = await hendleModel(res, type);
    const otpData = await Otp.findOne({ email });

    if (!otpData) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.EXPIRED_OTP,
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

    await Otp.findOneAndDelete({ email, otp });
    let fetchData = await Model.aggregate([{ $match: { email: email } }]);
    fetchData = fetchData[0];
    const encryptUser = encrypt(fetchData._id, ENCRYPTION_KEY);
    
    let encryptObj;
    if (type === "user") {
      encryptObj = { userId: encryptUser };
    } else if (type === "carrier") {
      encryptObj = { carrierId: encryptUser };
    }

    const accessToken = await commonAuth(encryptObj, ACCESS_TOKEN, ACCESS_TIME);
    await User.findByIdAndUpdate(
      fetchData._id,
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
    console.log("error--->", error);
    return handleException(logger, res, error);
  }
};

// Generate JWT Token
const generateJWTToken = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { encryptObj, expiresIn, type, role, ACCESS_TOKEN } = payload;
      const token = jwt.sign({ ...encryptObj, type, role }, ACCESS_TOKEN, {
        expiresIn,
      });
      resolve(token);
    } catch (error) {
      reject(error.message);
    }
  });
};

// Common Auth function for 2FA checking and JWT token generation
const commonAuth = (encryptObj, ACCESS_TOKEN, ACCESS_TIME) =>
  new Promise(async (resolve, reject) => {
    try {
      const payload = {
        expiresIn: ACCESS_TIME,
        encryptObj,
        type: "Access",
        role: "User",
        ACCESS_TOKEN,
      };
      const accessToken = await generateJWTToken(payload);

      resolve(accessToken);
    } catch (error) {
      console.log("common Auth Log :", error);
      reject(error);
    }
  });

module.exports = {
  verifyLoginOtp,
};
