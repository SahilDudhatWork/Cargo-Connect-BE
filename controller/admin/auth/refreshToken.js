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

    const encryptAdmin = encrypt(adminId, process.env.ADMIN_ENCRYPTION_KEY);

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
      adminId,
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
  refreshToken,
};
