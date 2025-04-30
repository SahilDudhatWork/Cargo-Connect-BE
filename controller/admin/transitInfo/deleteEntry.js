const TransitInfo = require("../../../model/common/transitInfo");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const deleteEntry = async (req, res) => {
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

    if (field === "modeOfTransportation") {
      getData.transportation.forEach((item) => {
        if (item.title === subfield) {
          item.modes = item.modes.filter(
            (mode) => mode._id.toString() !== subId
          );
        }
      });
    } else if (field === "typeOfTransportation") {
      getData.transportation = getData.transportation.filter(
        (item) => !item._id.equals(new ObjectId(subId))
      );
    } else {
      getData[field] = getData[field].filter(
        (item) => !item._id.equals(new ObjectId(subId))
      );
    }

    await TransitInfo.updateOne({}, getData, { new: true });

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.DELETED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  deleteEntry,
};
