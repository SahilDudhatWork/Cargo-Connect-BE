const TransitInfo = require("../../../model/admin/transitInfo");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const addEntry = async (req, res) => {
  let { logger, params, body } = req;
  try {
    const { field, subfield } = params;
    const getData = await TransitInfo.findOne();

    if (!getData) {
      return Response.success({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.DATA_NOT_AVAILABLE,
      });
    }

    if (field === "modeOfTransportation") {
      getData.transportation = getData.transportation.map((item) => {
        if (item.title === subfield) {
          item.modes.push(body);
        }
        return item;
      });
    } else if (field === "typeOfTransportation") {
      getData.transportation = getData.transportation.push(body);
    } else {
      getData[field] = getData[field].push(body);
    }

    await TransitInfo.updateOne({}, getData, { new: true });

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.ADDED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  addEntry,
};
