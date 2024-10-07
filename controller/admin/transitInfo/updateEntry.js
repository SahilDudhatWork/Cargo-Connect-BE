const TransitInfo = require("../../../model/admin/transitInfo");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const updateEntry = async (req, res) => {
  let { logger, params, body } = req;
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

    body._id = subId;
    let getData = await TransitInfo.findOne(updateQuery, { [field]: 1 });

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
        getData[field][subfield] = subfieldData.map((item) => {
          if (item._id == subId) {
            return { ...item, ...body };
          }
          return item;
        });
      }
    } else {
      getData[field] = getData[field].map((item) => {
        if (item._id == subId) {
          return { ...item, ...body };
        }
        return item;
      });
    }

    getData.save();
    const statusCode = getData ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = getData
      ? INFO_MSGS.UPDATED_SUCCESSFULLY
      : ERROR_MSGS.UPDATE_ERR;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: getData || null,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  updateEntry,
};
