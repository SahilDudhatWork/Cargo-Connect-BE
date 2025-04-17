const SpecialRequirements = require("../../../model/common/specialRequirements");
const TransitInfo = require("../../../model/common/transitInfo");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const getAll = async (req, res) => {
  const { logger, params } = req;
  try {
    const { type, id } = params;
    let result = [];

    if (type === "transportation") {
      const transitInfo = await TransitInfo.findOne();
      const item = transitInfo.transportation.find(
        (i) => i._id.toString() === id
      );
      result = item?.requirements || [];
    } else if (type === "post_bridge") {
      const specialRequirementsInfo = await SpecialRequirements.findById(id);
      result = specialRequirementsInfo?.requirements || [];
    }
    const statusCode = result ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message = result ? INFO_MSGS.SUCCESS : ERROR_MSGS.DATA_NOT_FOUND;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: result,
    });
  } catch (error) {
    return handleException(logger, res, error);
  }
};

module.exports = {
  getAll,
};
