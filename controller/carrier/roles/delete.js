const CarrierRole = require("../../../model/carrier/carrierRole");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { handleException } = require("../../../helper/exception");

const remove = async (req, res) => {
  const { logger, params } = req;
  try {
    const { id } = params;

    const deleteData = await CarrierRole.findByIdAndDelete(id);

    const statusCode = deleteData ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = deleteData
      ? INFO_MSGS.DELETED_SUCCESSFULLY
      : ERROR_MSGS.DELETE_ERR;

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
  remove,
};
