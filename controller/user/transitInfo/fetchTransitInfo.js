const TransitInfo = require("../../../model/admin/transitInfo");
const SpecialRequirements = require("../../../model/common/specialRequirements");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const fetchService = async (req, res) => {
  let { logger } = req;
  try {
    let getData = await TransitInfo.findOne();
    if (!getData) {
      return Response.error({
        req,
        res,
        status: STATUS_CODE.NOT_FOUND,
        msg: ERROR_MSGS.DATA_NOT_FOUND,
      });
    }
    const getSpecialRequirements = await SpecialRequirements.find(
      {},
      { post_bridge: 1 }
    );

    const newData = {
      modeOfTransportation: getData.modeOfTransportation,
      typeOfService: getData.typeOfService,
      typeOfTransportation: getData.typeOfTransportation,
      port_BridgeOfCrossing: getSpecialRequirements,
    };

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.SUCCESS,
      data: newData,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  fetchService,
};
