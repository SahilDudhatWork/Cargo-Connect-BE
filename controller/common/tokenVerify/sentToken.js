const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { handleException } = require("../../../helper/exception");
const { hendleModel } = require("../../../utils/hendleModel");
const { adminAuth } = require("../../../middleware/authToken/adminAuth");
const { carrierAuth } = require("../../../middleware/authToken/carrierAuth");
const { userAuth } = require("../../../middleware/authToken/userAuth");

const sentToken = async (req, res, next) => {
  const { logger } = req;
  try {
    const { type } = req.params;
    const Model = await hendleModel(res, type);
    let id;

    let authError = false;

    if (type === "user") {
      await userAuth(req, res, () => {
        if (res.headersSent) authError = true;
      });
      id = req.userId;
    } else if (type === "carrier") {
      await carrierAuth(req, res, () => {
        if (res.headersSent) authError = true;
      });
      id = req.carrierId;
    } else if (type === "admin") {
      await adminAuth(req, res, () => {
        if (res.headersSent) authError = true;
      });
      id = req.adminId;
    }

    // If authentication failed and response was sent, exit early
    if (authError) return;

    const checkDataExists = await Model.findById(id);

    if (!checkDataExists) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.BAD_REQUEST,
        data: { isValid: false },
      });
    }

    if (type !== "admin") {
      if (checkDataExists.isBlocked) {
        return Response.error({
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: ERROR_MSGS.ACCESS_RESTRICTED_ADMIN,
          data: { isValid: false },
        });
      }
    }

    return Response.success({
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.SUCCESS,
      data: { isValid: true },
    });
  } catch (error) {
    console.error("Error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  sentToken,
};
