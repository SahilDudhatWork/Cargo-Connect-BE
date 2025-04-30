const SpecialRequirements = require("../../../model/common/specialRequirements");
const TransitInfo = require("../../../model/common/transitInfo");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const getDetails = async (req, res) => {
  const { logger, params } = req;
  try {
    const { type, id, requirementId } = params;
    let result = null;

    if (type === "transportation") {
      const transitInfo = await TransitInfo.findOne();
      for (const transport of transitInfo.transportation) {
        for (const mode of transport.modes) {
          if (mode._id.toString() === id) {
            result = mode.requirements.find(
              (r) => r._id.toString() === requirementId
            );
            break;
          }
        }
        if (result) break;
      }
    } else if (type === "post_bridge") {
      const specialRequirementsInfo = await SpecialRequirements.findById(id);
      result = specialRequirementsInfo?.requirements.find(
        (r) => r._id.toString() === requirementId
      );
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
  getDetails,
};
