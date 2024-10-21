const Movement = require("../../../model/movement/movement");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const movementComplete = async (req, res) => {
  const { logger, params } = req;
  try {
    const { id } = params;
    let updateData = await Movement.findOneAndUpdate(
      { movementId: id },
      { status: "Completed" },
      { new: true }
    );

    const statusCode = updateData
      ? STATUS_CODE.OK
      : STATUS_CODE.INTERNAL_SERVER_ERROR;
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
    console.error("Error in movementComplete:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  movementComplete,
};
