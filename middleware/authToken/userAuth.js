const jwt = require("jsonwebtoken");
const User = require("../../model/user/user");
const Response = require("../../helper/response");
const { STATUS_CODE, ERROR_MSGS, INFO_MSGS } = require("../../helper/constant");
const { handleException } = require("../../helper/exception");
const { decrypt } = require("../../helper/encrypt-decrypt");

//- For User Token Decode
const userAuth = async (req, res, next) => {
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
    jwt.verify(token, process.env.USER_ACCESS_TOKEN, async (err, decoded) => {
      if (err) {
        const obj = {
          res,
          status: STATUS_CODE.UN_AUTHORIZED,
          msg: err,
        };
        return Response.error(obj);
      }
      req.userId = decrypt(decoded.userId, process.env.USER_ENCRYPTION_KEY);
      req.type = decoded.type;
      let checkUser = await User.findById({ _id: req.userId });
      if (checkUser && decoded.type !== checkUser.token.type) {
        const obj = {
          res,
          status: STATUS_CODE.UN_AUTHORIZED,
          msg: ERROR_MSGS.TOKEN_SESSION_EXPIRED,
        };
        return Response.error(obj);
      }
      if (!checkUser) {
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
  userAuth,
};
