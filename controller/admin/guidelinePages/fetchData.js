const GuidelinePages = require("../../../model/common/guidelinePages");
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
    const getData = await GuidelinePages.aggregate([
      { $sort: { createdAt: -1 } },
    ]);

    const statusCode = getData.length > 0 ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message =
      getData.length > 0 ? INFO_MSGS.SUCCESS : ERROR_MSGS.DATA_NOT_FOUND;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: getData,
    });
  } catch (error) {
    return handleException(logger, res, error);
  }
};

module.exports = {
  fetchData,
};
