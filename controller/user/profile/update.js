const User = require("../../../model/user/user");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;

const update = async (req, res) => {
  const { logger } = req;
  try {
    const { userId } = req;
    const { email, password, accountId } = req.body;

    if (accountId || password) {
      let errorMsg;
      if (accountId) errorMsg = `AccountId ${ERROR_MSGS.NOT_EDITABLE}`;
      else if (password) errorMsg = `Password ${ERROR_MSGS.NOT_EDITABLE}`;

      const obj = { res, status: STATUS_CODE.BAD_REQUEST, msg: errorMsg };
      return Response.error(obj);
    }

    const emailInUse = await User.findOne({ email });
    if (emailInUse && !emailInUse._id.equals(userId)) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.EMAIL_EXIST,
      });
    }
    const updateData = await User.findByIdAndUpdate(
      { _id: new ObjectId(userId) },
      req.body,
      { new: true }
    );

    const result = updateData.toObject();
    delete result.password;
    delete result.companyFormation;
    delete result.token;
    delete result.forgotPassword;

    const statusCode = updateData ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = updateData
      ? INFO_MSGS.UPDATED_SUCCESSFULLY
      : ERROR_MSGS.UPDATE_ERR;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: result,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  update,
};
