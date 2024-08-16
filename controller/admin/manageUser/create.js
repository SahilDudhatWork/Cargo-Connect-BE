const User = require("../../../model/user/user");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const {
  emailAndPasswordVerification,
} = require("../../../helper/joi-validation");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { encrypt, decrypt } = require("../../../helper/encrypt-decrypt");
const { ObjectId } = require("mongoose").Types;

const create = async (req, res) => {
  const { logger } = req;
  try {
    const { email, password } = req.body;

    const { error } = emailAndPasswordVerification({
      email,
      password,
    });
    if (error) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: error.details[0].message,
      };
      return Response.error(obj);
    }

    const userEmailExist = await User.findOne({
      email: email,
    });
    if (userEmailExist) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.EMAIL_EXIST,
      };
      return Response.error(obj);
    }

    const passwordHash = encrypt(password, process.env.PASSWORD_ENCRYPTION_KEY);

    req.body.password = passwordHash;
    let saveData = await User.create(req.body);

    const statusCode = saveData ? STATUS_CODE.CREATED : STATUS_CODE.BAD_REQUEST;
    const message = saveData
      ? INFO_MSGS.CREATED_SUCCESSFULLY
      : ERROR_MSGS.BAD_REQUEST;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: saveData || null,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  create,
};
