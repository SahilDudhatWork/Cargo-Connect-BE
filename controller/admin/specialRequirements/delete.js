const SpecialRequirements = require("../../../model/common/specialRequirements");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const removeData = async (req, res) => {
  const { logger, params } = req;
  try {
    const { id } = params;
    const getData = await SpecialRequirements.findByIdAndDelete(id);

    const statusCode = getData ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = getData
      ? INFO_MSGS.DELETED_SUCCESSFULLY
      : ERROR_MSGS.DATA_NOT_AVAILABLE;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: getData || null,
    });
  } catch (error) {
    return handleException(logger, res, error);
  }
};

module.exports = {
  removeData,
};
