const Movement = require("../../../model/user/movement");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const hendleRequest = async (req, res) => {
  const { logger, carrierId } = req;
  try {
    const { id } = req.params;

    let updateData = await Movement.findByIdAndUpdate(
      { _id: new ObjectId(id) },
      {
        carrierId: carrierId,
        isAssign: true,
      },
      { new: true }
    );

    const statusCode = updateData ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message = updateData
      ? INFO_MSGS.UPDATED_SUCCESSFULLY
      : ERROR_MSGS.UPDATE_ERR;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: updateData || null,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  hendleRequest,
};
