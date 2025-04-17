const SpecialRequirements = require("../../../model/common/specialRequirements");
const TransitInfo = require("../../../model/common/transitInfo");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { STATUS_CODE, INFO_MSGS } = require("../../../helper/constant");

const removeData = async (req, res) => {
  const { logger, params } = req;
  try {
    const { type, id, requirementId } = params;

    if (type === "transportation") {
      const transitInfo = await TransitInfo.findOne();
      for (const i of transitInfo.transportation) {
        if (i._id.toString() === id) {
          i.requirements = i.requirements.filter(
            (r) => r._id.toString() !== requirementId
          );
        }
      }
      await transitInfo.save();
    } else if (type === "post_bridge") {
      const specialRequirementsInfo = await SpecialRequirements.findById(id);
      specialRequirementsInfo.requirements =
        specialRequirementsInfo.requirements.filter(
          (r) => r._id.toString() !== requirementId
        );
      await specialRequirementsInfo.save();
    }

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.DELETED_SUCCESSFULLY,
    });
  } catch (error) {
    return handleException(logger, res, error);
  }
};

module.exports = {
  removeData,
};
