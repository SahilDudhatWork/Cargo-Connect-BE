const RateCard = require("../../../model/common/rateCard");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const {
  typeOfService,
  typeOfTransportation_modeOfTransportation,
  port_BridgeOfCrossing,
  specialRequirements,
} = require("./fetchData");

const getDetails = async (req, res) => {
  const { logger, params } = req;
  try {
    const { id } = params;

    let getData = await RateCard.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      ...typeOfService(),
      ...typeOfTransportation_modeOfTransportation(),
      ...port_BridgeOfCrossing(),
      ...specialRequirements(),
      {
        $project: {
          __v: 0,
          typeOfServiceInfo: 0,
          transportationInfo: 0,
        },
      },
    ]);

    getData = getData[0];

    const statusCode = getData ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message = getData ? INFO_MSGS.SUCCESS : ERROR_MSGS.DATA_NOT_FOUND;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: getData || null,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  getDetails,
};
