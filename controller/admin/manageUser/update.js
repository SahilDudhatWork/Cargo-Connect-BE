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
    const { id } = req.params;
    const { email } = req.body;

    const fetchUser = await User.findById(id);

    if (!fetchUser) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.DATA_NOT_AVAILABLE,
      };
      return Response.error(obj);
    }

    const userEmailExist = await User.findOne({ email: email });
    console.log(
      "userEmailExist && userEmailExist._id != id :>> ",
      userEmailExist && userEmailExist._id != id
    );
    if (userEmailExist && userEmailExist._id != id) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.EMAIL_EXIST,
      };
      return Response.error(obj);
    }

    const updateData = await User.findByIdAndUpdate(
      { _id: new ObjectId(id) },
      req.body,
      { new: true }
    );

    const statusCode = updateData ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = updateData
      ? INFO_MSGS.UPDATED_SUCCESSFULLY
      : ERROR_MSGS.UPDATE_ERR;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  update,
};
