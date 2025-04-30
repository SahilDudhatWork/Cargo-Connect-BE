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
    const { portBridgeId, transportationId } = body;

    if (!portBridgeId && !transportationId) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: `Either portBridgeId or transportationId ${ERROR_MSGS.KEY_REQUIRED}`,
      });
    }

    let result = null;

    if (portBridgeId) {
      const specialRequirementsInfo = await SpecialRequirements.findById(
        portBridgeId
      );

      if (specialRequirementsInfo?.requirements?.length > 0) {
        result = {
          _id: specialRequirementsInfo._id,
          match: "port_bridge",
          title: specialRequirementsInfo.port_bridge,
          requirements: specialRequirementsInfo.requirements,
        };
      }
    }

    if (!result && transportationId) {
      const transitInfo = await TransitInfo.findOne();
      const item = transitInfo?.transportation?.find(
        (i) => i._id.toString() === transportationId
      );

      if (item?.requirements?.length > 0) {
        result = {
          _id: item._id,
          match: "transportation",
          title: item.title,
          requirements: item.requirements,
        };
      }
    }

    if (!result) {
      return Response.success({
        req,
        res,
        status: STATUS_CODE.OK,
        msg: ERROR_MSGS.DATA_NOT_AVAILABLE,
        data: [],
      });
    }

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.SUCCESS,
      data: result,
    });
  } catch (error) {
    return handleException(logger, res, error);
  }
};

module.exports = {
  getDetails,
};
