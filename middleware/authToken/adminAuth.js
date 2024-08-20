const jwt = require("jsonwebtoken");
const Admin = require("../../model/admin/admin");
const Response = require("../../helper/response");
const { STATUS_CODE, ERROR_MSGS, INFO_MSGS } = require("../../helper/constant");
const { handleException } = require("../../helper/exception");
const { decrypt } = require("../../helper/encrypt-decrypt");

//- For Admin Token Decode
const adminAuth = async (req, res, next) => {
  const { logger } = req;
  try {
    let token =
      req.body.token ||
      req.query.token ||
      req.headers["x-auth-token"] ||
      req.headers["authorization"];
    if (!token || token.length == 0 || token.toString() === "null") {
      const obj = {
        res,
        status: STATUS_CODE.UN_AUTHORIZED,
        msg: ERROR_MSGS.TOKEN_MISSING,
      };
      return Response.error(obj);
    }

    if (!token.startsWith("Bearer ")) {
      const obj = {
        res,
        status: STATUS_CODE.UN_AUTHORIZED,
        msg: ERROR_MSGS.INVALID_TOKEN_FORMAT,
      };
      return Response.error(obj);
    }

    // Remove Bearer from string
    token = token.slice(7, token.length).trimLeft();
    jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN, async (err, decoded) => {
      if (err) {
        const obj = {
          res,
          status: STATUS_CODE.UN_AUTHORIZED,
          msg: err,
        };
        return Response.error(obj);
      }
      req.adminId = decrypt(decoded.adminId, process.env.ADMIN_ENCRYPTION_KEY);
      req.type = decoded.type;
      req.role = decoded.role;

      if (req.role !== "Admin") {
        const obj = {
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: ERROR_MSGS.PERMISSIONS_DENIED,
        };
        return Response.error(obj);
      }
      let checkAdmin = await Admin.findById({ _id: req.adminId });
      if (decoded.type !== checkAdmin.token.type) {
        const obj = {
          res,
          status: STATUS_CODE.UN_AUTHORIZED,
          msg: ERROR_MSGS.TOKEN_SESSION_EXPIRED,
        };
        return Response.error(obj);
      }
      if (!checkAdmin) {
        const obj = {
          res,
          status: STATUS_CODE.UN_AUTHORIZED,
          msg: ERROR_MSGS.UN_AUTHORIZED,
        };
        return Response.error(obj);
      }
      next();
    });
  } catch (error) {
    console.log("auth error", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  adminAuth,
  adminAuth,
};
