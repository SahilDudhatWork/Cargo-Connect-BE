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
  const { logger, body } = req;
  try {
    const { portBridgeId, transportationId, typeOfServiceId } = body;

    if (!portBridgeId && !transportationId && !typeOfServiceId) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: `Either portBridgeId and typeOfServiceId or transportationId ${ERROR_MSGS.KEY_REQUIRED}`,
      });
    }

    let requirements = [];

    if (portBridgeId) {
      const specialRequirementsInfo = await SpecialRequirements.findById(
        portBridgeId
      );

      if (specialRequirementsInfo?.requirements?.length > 0) {
        requirements.push(...specialRequirementsInfo.requirements);
      }
    }

    if (transportationId) {
      const transitInfo = await TransitInfo.findOne();
      const item = transitInfo.transportation.find((i) =>
        i.modes.some((mode) => mode._id.toString() === transportationId)
      );
      const mode = item.modes.find(
        (m) => m._id.toString() === transportationId
      );
      if (mode?.requirements?.length > 0) {
        requirements.push(...mode.requirements);
      }
    }

    if (typeOfServiceId) {
      const transitInfo = await TransitInfo.findOne();
      const item = transitInfo.typeOfService.find(
        (i) => i._id.toString() === typeOfServiceId
      );
      if (item?.requirements?.length > 0) {
        requirements.push(...item.requirements);
      }
    }

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg:
        requirements.length > 0
          ? INFO_MSGS.SUCCESS
          : ERROR_MSGS.DATA_NOT_AVAILABLE,
      data:
        requirements.length > 0
          ? {
              _id: null,
              match: "All",
              title: null,
              requirements: requirements,
            }
          : [],
    });
  } catch (error) {
    return handleException(logger, res, error);
  }
};

module.exports = {
  getDetails,
};
