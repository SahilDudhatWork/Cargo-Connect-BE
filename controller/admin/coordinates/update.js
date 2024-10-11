const Coordinates = require("../../../model/common/coordinates");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const update = async (req, res) => {
  const { logger, params, body } = req;
  try {
    const { id } = params;
    const updatedData = await Coordinates.findByIdAndUpdate(id, body, {
      new: true,
    });
    const statusCode = updatedData ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = updatedData
      ? INFO_MSGS.UPDATED_SUCCESSFULLY
      : ERROR_MSGS.UPDATE_ERR;

    return Response.success({
      req,
      res,
      status: statusCode,
      msg: message,
      data: updatedData,
    });
  } catch (error) {
    console.error("Error :", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  update,
};
