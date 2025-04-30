const TransitInfo = require("../../../model/common/transitInfo");
const { handleException } = require("../../../helper/exception");
const { ObjectId } = require("mongoose").Types;
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const updateEntry = async (req, res) => {
  const { logger, params, body } = req;
  try {
    const { field, subfield, subId } = params;

    body._id = new ObjectId(subId);
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
          item.modes = item.modes.map((mode) => {
            if (mode._id.toString() === subId) {
              return { ...mode, ...body };
            }
            return mode;
          });
        }
        return item;
      });
    } else if (field === "typeOfTransportation") {
      getData.transportation = getData.transportation.map((item) => {
        if (item._id.equals(new ObjectId(subId))) {
          return { ...item, ...body };
        }
        return item;
      });
    } else {
      getData[field] = getData[field].map((item) => {
        if (item._id.equals(new ObjectId(subId))) {
          return { ...item, ...body };
        }
        return item;
      });
    }

    await TransitInfo.updateOne({}, getData, { new: true });

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.UPDATED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  updateEntry,
};
