const SpecialRequirements = require("../../../model/common/specialRequirements");
const TransitInfo = require("../../../model/common/transitInfo");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const getAllTrans_Port = async (req, res) => {
  const { logger, params } = req;
  try {
    const { type } = params;
    let result = [];

    if (type === "transportation") {
      const { transportation } = await TransitInfo.findOne();
      let array = await transportation.map((i) => {
        return {
          _id: i._id,
          type: "transportation",
          title: i.title,
          requirements: i.requirements,
        };
      });
      result = array;
    } else if (type === "post_bridge") {
      const specialRequirementsInfo = await SpecialRequirements.find();
      // result = specialRequirementsInfo;
      let array = specialRequirementsInfo.map((i) => {
        return {
          _id: i._id,
          type: "post_bridge",
          title: i.post_bridge,
          requirements: i.requirements,
        };
      });
      result = array;
    }
    const statusCode = result ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message = result ? INFO_MSGS.SUCCESS : ERROR_MSGS.DATA_NOT_FOUND;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: result,
    });
  } catch (error) {
    return handleException(logger, res, error);
  }
};

module.exports = {
  getAllTrans_Port,
};
