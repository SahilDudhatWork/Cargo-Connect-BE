const Admin = require("../../../model/admin/admin");
const { handleException } = require("../../../helper/exception");
const { encrypt } = require("../../../helper/encrypt-decrypt");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { generateAccountId } = require("../../../utils/generateUniqueId");

/**
 * Register a new admin with email and password
 */
const createAdmin = async (req, res) => {
  const { logger, body } = req;
  try {
    const { email, password } = body;
    const adminEmailExist = await Admin.findOne({
      email: email,
    });
    if (adminEmailExist) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_EXISTS,
      };
      return Response.error(obj);
    }

    const passwordHash = encrypt(password, process.env.PASSWORD_ENCRYPTION_KEY);

    body.accountId = generateAccountId();
    body.password = passwordHash;
    await Admin.create(body);

    const obj = {
      res,
      status: STATUS_CODE.CREATED,
      msg: INFO_MSGS.CREATED_SUCCESSFULLY,
    };
    return Response.success(obj);
  } catch (error) {
    console.log("error--->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  createAdmin,
};
