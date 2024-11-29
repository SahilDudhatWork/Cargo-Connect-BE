const User = require("../../../model/user/user");
const { handleException } = require("../../../helper/exception");
const { encrypt } = require("../../../helper/encrypt-decrypt");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  INFO_MSGS,
  ERROR_MSGS,
} = require("../../../helper/constant");

const updateSubUser = async (req, res) => {
  let { logger, params, body } = req;
  try {
    const { id } = params;
    if (body.password) {
      body.password = encrypt(
        body.password,
        process.env.PASSWORD_ENCRYPTION_KEY
      );
    }

    if (body.email) {
      const existingUser = await User.findOne({ email: body.email });
      if (existingUser && existingUser.accountId !== +id) {
        return Response.error({
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: ERROR_MSGS.EMAIL_EXIST,
        });
      }
    }

    const updateData = await User.findOneAndUpdate({ accountId: id }, body, {
      new: true,
    });
    return Response.success({
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.UPDATED_SUCCESSFULLY,
      data: updateData,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  updateSubUser,
};
