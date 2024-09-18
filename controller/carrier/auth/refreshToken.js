const Carrier = require("../../../model/carrier/carrier");
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
  const { logger, carrierId } = req;
  try {
    const carrierInfo = await Carrier.findById({ _id: carrierId });
    if (!carrierInfo) {
      let obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_NOT_FOUND,
      };
      return Response.error(obj);
    }

    const encryptCarrier = encrypt(carrierId, process.env.CARRIER_ENCRYPTION_KEY);
    const accessToken = await commonAuth(encryptCarrier);

    await Carrier.findByIdAndUpdate(
      carrierId,
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
const commonAuth = async (encryptCarrier) => {
  try {
    const payload = {
      encryptCarrier,
      expiresIn: process.env.CARRIER_ACCESS_TIME,
      type: "Access",
      role: "Carrier",
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
    const { encryptCarrier, expiresIn, type, role } = payload;
    const token = jwt.sign(
      { carrierId: encryptCarrier, type, role },
      process.env.CARRIER_ACCESS_TOKEN,
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
