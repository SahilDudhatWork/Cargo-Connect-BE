const TransitInfo = require("../../../model/admin/transitInfo");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const deleteEntry = async (req, res) => {
  let { logger, params } = req;
  try {
    const { field, subfield, subId } = params;
    let updateQuery;

    if (subfield) {
      updateQuery = {
        [`${field}.${subfield}`]: { $elemMatch: { _id: subId } },
      };
    } else {
      updateQuery = {
        [`${field}`]: { $elemMatch: { _id: subId } },
      };
    }

    let getData = await TransitInfo.findOne(updateQuery);

    if (!getData) {
      return Response.success({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.DATA_NOT_AVAILABLE,
      });
    }

    if (subfield) {
      const subfieldData = getData[field][subfield];
      if (subfieldData) {
        getData[field][subfield] = subfieldData.filter(
          (item) => item._id != subId
        );
      }
    } else {
      getData[field] = getData[field].filter((item) => item._id != subId);
    }

    await getData.save();

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.DELETED_SUCCESSFULLY,
      data: getData,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  deleteEntry,
};
