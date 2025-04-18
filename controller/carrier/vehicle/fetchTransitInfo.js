const TransitInfo = require("../../../model/common/transitInfo");
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
      { port_bridge: 1 }
    );

    let modeOfTransportation = {};

    getData.transportation.forEach((i) => {
      modeOfTransportation[i.title] = i.modes.map((mode) => ({
        title: mode.title,
        description: mode.description,
        price: mode.price,
        _id: mode._id,
      }));
    });

    let newResult = {
      typeOfService: getData.typeOfService,
      typeOfTransportation: getData.transportation.map((i) => ({
        title: i.title,
        price: i.price,
        description: i.description,
        _id: i._id,
      })),
      modeOfTransportation,
      securingEquipment: getData.securingEquipment,
      port_BridgeOfCrossing: getSpecialRequirements,
    };

    const statusCode = newResult ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message = newResult ? INFO_MSGS.SUCCESS : ERROR_MSGS.DATA_NOT_FOUND;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: newResult,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  fetchTransitInfo,
};
