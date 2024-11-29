const Carrier = require("../../../model/carrier/carrier");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  INFO_MSGS,
  ERROR_MSGS,
} = require("../../../helper/constant");

const deleteCarrier = async (req, res) => {
  let { logger, params } = req;
  try {
    const { id } = params;

    const deleteData = await Carrier.findOneAndDelete({ accountId: id });

    const statusCode = deleteData ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = deleteData
      ? INFO_MSGS.DELETED_SUCCESSFULLY
      : ERROR_MSGS.DATA_NOT_FOUND;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  deleteCarrier,
};
