const Carrier = require("../../../model/carrier/carrier");
const { validateResetPassword } = require("../../../helper/joi-validation");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { encrypt } = require("../../../helper/encrypt-decrypt");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const resetPassword = async (req, res) => {
  const { logger } = req;
  try {
    const { password } = req.body;
    const { email } = req;
    const { error } = validateResetPassword({ password });

    if (error) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: error.details[0].message,
      };
      return Response.error(obj);
    }

    const passwordHash = encrypt(password, process.env.PASSWORD_ENCRYPTION_KEY);

    const carrierEmailExist = await Carrier.findOne({
      email: email,
    });
    if (!carrierEmailExist) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_NOT_EXISTS,
      };
      return Response.error(obj);
    }

    await Carrier.findByIdAndUpdate(
      { _id: carrierEmailExist._id },
      {
        password: passwordHash,
        "forgotPassword.createdAt": Date.now(),
      },
      { new: true }
    );

    const obj = {
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.PASSWORD_CHANGED,
    };
    return Response.error(obj);
  } catch (error) {
    console.log("resetPassword Error", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  resetPassword,
};
