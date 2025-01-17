const jwt = require("jsonwebtoken");
const Operator = require("../../model/operator/operator");
const Response = require("../../helper/response");
const { STATUS_CODE, ERROR_MSGS, INFO_MSGS } = require("../../helper/constant");
const { handleException } = require("../../helper/exception");
const { decrypt } = require("../../helper/encrypt-decrypt");

//- For Operator Token Decode
const operatorAuth = async (req, res, next) => {
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
      process.env.OPERATOR_ACCESS_TOKEN,
      async (err, decoded) => {
        if (err) {
          const obj = {
            res,
            status: STATUS_CODE.UN_AUTHORIZED,
            msg: err,
          };
          return Response.error(obj);
        }
        req.operatorId = decrypt(
          decoded.operatorId,
          process.env.OPERATOR_ENCRYPTION_KEY
        );
        req.type = decoded.type;
        req.role = decoded.role;

        let checkOperator = await Operator.findById({ _id: req.operatorId });

        if (!checkOperator) {
          const obj = {
            res,
            status: STATUS_CODE.UN_AUTHORIZED,
            msg: ERROR_MSGS.UN_AUTHORIZED,
          };
          return Response.error(obj);
        }

        // if (checkOperator.token.accessToken !== token) {
        //   const obj = {
        //     res,
        //     status: STATUS_CODE.UN_AUTHORIZED,
        //     msg: ERROR_MSGS.TOKEN_SESSION_EXPIRED,
        //   };
        //   return Response.error(obj);
        // }

        // if (checkOperator && decoded.type !== checkOperator.token.type) {
        //   const obj = {
        //     res,
        //     status: STATUS_CODE.UN_AUTHORIZED,
        //     msg: ERROR_MSGS.TOKEN_SESSION_EXPIRED,
        //   };
        //   return Response.error(obj);
        // }
        next();
      }
    );
  } catch (error) {
    console.log("auth error", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  operatorAuth,
};
