const Setting = require("../../../model/common/settings");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const fetchData = async (req, res) => {
  const { logger } = req;
  try {
    let getData = await Setting.findOne();
    const statusCode = getData ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = getData ? INFO_MSGS.SUCCESS : ERROR_MSGS.BAD_REQUEST;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: getData || null,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  fetchData,
};
