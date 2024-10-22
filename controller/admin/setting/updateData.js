const Setting = require("../../../model/common/settings");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const updateData = async (req, res) => {
  const { logger, body } = req;
  try {
    let saveData = await Setting.findOneAndUpdate({}, body, { new: true });
    const statusCode = saveData ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = saveData
      ? INFO_MSGS.UPDATED_SUCCESSFULLY
      : ERROR_MSGS.UPDATE_ERR;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: saveData || null,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  updateData,
};
