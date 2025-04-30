const SpecialRequirements = require("../../../model/common/specialRequirements");
const TransitInfo = require("../../../model/common/transitInfo");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { STATUS_CODE, INFO_MSGS } = require("../../../helper/constant");

const create = async (req, res) => {
  const { logger, body, params } = req;
  try {
    const { type, id } = params;
    const { requirements } = body;

    if (type === "transportation") {
      const transitInfo = await TransitInfo.findOne();
      for (const i of transitInfo.transportation) {
        if (i.modes.length > 0) {
          for (const mode of i.modes) {
            if (mode._id.toString() === id) {
              mode.requirements.push(...requirements);
            }
          }
        }
      }
      await transitInfo.save();
    } else if (type === "port_bridge") {
      const specialRequirementsInfo = await SpecialRequirements.findById(id);
      specialRequirementsInfo.requirements.push(...requirements);
      await specialRequirementsInfo.save();
    }

    return Response.success({
      req,
      res,
      status: STATUS_CODE.CREATED,
      msg: INFO_MSGS.CREATED_SUCCESSFULLY,
    });
  } catch (error) {
    return handleException(logger, res, error);
  }
};

module.exports = {
  create,
};
