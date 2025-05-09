const specialRequirements = require("../../../model/common/specialRequirements");
const transitInfo = require("../../../model/common/transitInfo");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const fetchAllServices = async (req, res) => {
  const { logger, params } = req;
  try {
    const specialRequirementsInfo = await specialRequirements.find();
    const fetchTransitInfo = await transitInfo.findOne();

    let getData = {
      typeOfService: [],
      typeOfTransportation: [],
      modeOfTransportation: [],
      port_BridgeOfCrossing: [],
      specialRequirements: [],
    };

    fetchTransitInfo.typeOfService.forEach((i) => {
      getData.typeOfService.push({
        _id: i._id,
        title: i.title,
      });
    });
    fetchTransitInfo.transportation.forEach((i) => {
      getData.typeOfTransportation.push({
        _id: i._id,
        title: i.title,
      });
      i.modes.map((m) => {
        getData.modeOfTransportation.push({
          _id: m._id,
          title: m.title,
        });
      });
    });
    specialRequirementsInfo.map((i) => {
      getData.port_BridgeOfCrossing.push({
        _id: i._id,
        title: i.post_bridge,
      });
      i.requirements.map((t) => {
        getData.specialRequirements.push({
          _id: t._id,
          title: t.type,
        });
      });
    });

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
  fetchAllServices,
};
