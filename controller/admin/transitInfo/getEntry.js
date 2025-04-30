const TransitInfo = require("../../../model/common/transitInfo");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { ObjectId } = require("mongoose").Types;

const getEntry = async (req, res) => {
  const { logger, params } = req;
  try {
    const { field, subfield, subId } = params;

    const getData = await TransitInfo.findOne();

    if (!getData) {
      return Response.success({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.DATA_NOT_AVAILABLE,
      });
    }

    let entry;
    if (field === "modeOfTransportation") {
      getData.transportation.forEach((item) => {
        if (item.title === subfield) {
          entry = item.modes.filter((mode) => mode._id.toString() === subId);
        }
      });
    } else if (field === "typeOfTransportation") {
      entry = getData.transportation.filter((item) =>
        item._id.equals(new ObjectId(subId))
      );
    } else {
      entry = getData[field].filter((item) =>
        item._id.equals(new ObjectId(subId))
      );
    }

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.SUCCESS,
      data: entry[0] || null,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  getEntry,
};
