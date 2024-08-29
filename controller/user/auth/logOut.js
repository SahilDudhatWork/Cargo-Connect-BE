const User = require("../../../model/user/user");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { STATUS_CODE, INFO_MSGS } = require("../../../helper/constant");

const logOut = async (req, res) => {
  const { logger, userId } = req;
  try {
    await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          "token.type": "Denied",
        },
      }
    );
    const obj = {
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.SUCCESS,
    };
    return Response.success(obj);
  } catch (error) {
    console.log("logOut Error", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  logOut,
};
