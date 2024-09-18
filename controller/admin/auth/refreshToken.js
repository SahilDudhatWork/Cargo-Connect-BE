const Admin = require("../../../model/admin/admin");
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
  const { logger, adminId } = req;
  try {
    const adminInfo = await Admin.findById({ _id: adminId });
    if (!adminInfo) {
      let obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_NOT_FOUND,
      };
      return Response.error(obj);
    }

    const encryptAdmin = encrypt(
      adminId,
      process.env.ADMIN_ENCRYPTION_KEY
    );
    const accessToken = await commonAuth(encryptAdmin);

    await Admin.findByIdAndUpdate(
      adminId,
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
const commonAuth = async (encryptAdmin) => {
  try {
    const payload = {
      encryptAdmin,
      expiresIn: process.env.ADMIN_ACCESS_TIME,
      type: "Access",
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
    const { encryptAdmin, expiresIn, type, role } = payload;
    const token = jwt.sign(
      { adminId: encryptAdmin, type, role },
      process.env.ADMIN_ACCESS_TOKEN,
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
