const SpecialRequirements = require("../../../model/common/specialRequirements");
const TransitInfo = require("../../../model/common/transitInfo");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { STATUS_CODE, INFO_MSGS } = require("../../../helper/constant");

const update = async (req, res) => {
  const { logger, body, params } = req;
  try {
    const { type, id, requirementId } = params;

    if (type === "transportation") {
      const transitInfo = await TransitInfo.findOne();
      for (const transport of transitInfo.transportation) {
        for (const mode of transport.modes) {
          if (mode._id.toString() === id) {
            const reqItem = mode.requirements.find(
              (r) => r._id.toString() === requirementId
            );
            if (reqItem) Object.assign(reqItem, body);
          }
        }
      }
      await transitInfo.save();
    } else if (type === "port_bridge") {
      const specialRequirementsInfo = await SpecialRequirements.findById(id);
      const reqItem = specialRequirementsInfo.requirements.find(
        (r) => r._id.toString() === requirementId
      );
      if (reqItem) Object.assign(reqItem, body);
      await specialRequirementsInfo.save();
    }

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.UPDATED_SUCCESSFULLY,
    });
  } catch (error) {
    return handleException(logger, res, error);
  }
};

module.exports = {
  update,
};
