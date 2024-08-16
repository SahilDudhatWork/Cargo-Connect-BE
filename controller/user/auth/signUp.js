const User = require("../../../model/user/user");
const { handleException } = require("../../../helper/exception");
const { encrypt, decrypt } = require("../../../helper/encrypt-decrypt");
const Response = require("../../../helper/response");
const {
  emailAndPasswordVerification,
} = require("../../../helper/joi-validation");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

/**
 * Register a new user with email and password
 */
const signUp = async (req, res) => {
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
        msg: ERROR_MSGS.ACCOUNT_EXISTS,
      };
      return Response.error(obj);
    }
    const generateAccountId = () => {
      const timestamp = Date.now().toString();
      const randomDigits = Array(6)
        .fill(0)
        .map(() => Math.floor(Math.random() * 10))
        .join("");
      return timestamp.slice(-10) + randomDigits;
    };

    const passwordHash = encrypt(password, process.env.PASSWORD_ENCRYPTION_KEY);

    req.body.accountId = generateAccountId();
    req.body.password = passwordHash;
    await User.create(req.body);

    const obj = {
      res,
      status: STATUS_CODE.CREATED,
      msg: INFO_MSGS.SUCCESSFUL_REGISTER,
    };
    return Response.success(obj);
  } catch (error) {
    console.log("error--->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  signUp,
};
