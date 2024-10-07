const TransitInfo = require("../../../model/admin/transitInfo");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const getEntry = async (req, res) => {
  let { logger, params } = req;
  try {
    const { field, subfield, subId } = params;
    let query;

    if (subfield) {
      query = {
        [`${field}.${subfield}`]: { $elemMatch: { _id: subId } },
      };
    } else {
      query = {
        [`${field}`]: { $elemMatch: { _id: subId } },
      };
    }

    const getData = await TransitInfo.findOne(query);

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
        const entry = subfieldData.find((item) => item._id == subId);
        return Response.success({
          req,
          res,
          status: STATUS_CODE.OK,
          msg: INFO_MSGS.SUCCESS,
          data: entry || null,
        });
      }
    } else {
      const entry = getData[field].find((item) => item._id == subId);
      return Response.success({
        req,
        res,
        status: STATUS_CODE.OK,
        msg: INFO_MSGS.SUCCESS,
        data: entry || null,
      });
    }
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  getEntry,
};
