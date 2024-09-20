const jwt = require("jsonwebtoken");
const User = require("../../model/user/user");
const Admin = require("../../model/admin/admin");
const Carrier = require("../../model/carrier/carrier");
const Operator = require("../../model/operator/operator");
const Response = require("../../helper/response");
const { STATUS_CODE, ERROR_MSGS, INFO_MSGS } = require("../../helper/constant");
const { handleException } = require("../../helper/exception");
const { decrypt } = require("../../helper/encrypt-decrypt");

//- For User Token Decode
const refreshAuth = async (req, res, next) => {
  const { logger, body, query, headers } = req;
  try {
    let token =
      body.token ||
      query.token ||
      headers["x-auth-token"] ||
      headers["authorization"];
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
    jwt.verify(
      token,
      process.env.REFRESH_ACCESS_TOKEN,
      async (err, decoded) => {
        if (err) {
          const obj = {
            res,
            status: STATUS_CODE.UN_AUTHORIZED,
            msg: err,
          };
          return Response.error(obj);
        }

        let Model;
        let id;
        if (decoded.role === "User") {
          Model = User;
          req.userId = decrypt(decoded.userId, process.env.USER_ENCRYPTION_KEY);
          req.type = decoded.type;
          id = req.userId;
        } else if (decoded.role === "Admin") {
          Model = Admin;
          req.adminId = decrypt(
            decoded.adminId,
            process.env.ADMIN_ENCRYPTION_KEY
          );
          req.type = decoded.type;
          id = req.adminId;
        } else if (decoded.role === "Carrier") {
          Model = Carrier;
          req.carrierId = decrypt(
            decoded.carrierId,
            process.env.CARRIER_ENCRYPTION_KEY
          );
          req.type = decoded.type;
          id = req.carrierId;
        } else if (decoded.role === "Operator") {
          Model = Operator;
          req.operatorId = decrypt(
            decoded.operatorId,
            process.env.OPERATOR_ENCRYPTION_KEY
          );
          req.type = decoded.type;
          id = req.operatorId;
        }
        let checkData = await Model.findById(id);

        if (!checkData) {
          const obj = {
            res,
            status: STATUS_CODE.UN_AUTHORIZED,
            msg: ERROR_MSGS.UN_AUTHORIZED,
          };
          return Response.error(obj);
        }

        if (checkData.token.refreshToken !== token) {
          const obj = {
            res,
            status: STATUS_CODE.UN_AUTHORIZED,
            msg: ERROR_MSGS.TOKEN_SESSION_EXPIRED,
          };
          return Response.error(obj);
        }

        if (checkData && decoded.type !== "Refresh") {
          const obj = {
            res,
            status: STATUS_CODE.UN_AUTHORIZED,
            msg: ERROR_MSGS.ACCESS_TOKEN_REQUIRED,
          };
          return Response.error(obj);
        }
        next();
      }
    );
  } catch (error) {
    console.log("auth error", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  refreshAuth,
};
