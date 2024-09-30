const SpecialRequirements = require("../../../model/common/specialRequirements");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const getAll = async (req, res) => {
  const { logger } = req;
  try {
    const getData = await SpecialRequirements.find({}, { post_bridge: 1 });

    const statusCode = getData ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message = getData ? INFO_MSGS.SUCCESS : ERROR_MSGS.DATA_NOT_FOUND;

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
  getAll,
};
