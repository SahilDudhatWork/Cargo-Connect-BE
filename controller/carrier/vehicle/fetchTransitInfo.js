const TransitInfo = require("../../../model/admin/transitInfo");
const SpecialRequirements = require("../../../model/common/specialRequirements");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const fetchTransitInfo = async (req, res) => {
  let { logger } = req;
  try {
    let getData = await TransitInfo.findOne();
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

    const statusCode = newData ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message = newData ? INFO_MSGS.SUCCESS : ERROR_MSGS.DATA_NOT_FOUND;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: newData,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  fetchTransitInfo,
};
