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
    let updateQuery;
    if (subfield) {
      updateQuery = { [`${field}.${subfield}`]: body };
    } else {
      updateQuery = { [field]: body };
    }

    const saveData = await TransitInfo.findOneAndUpdate(
      {},
      { $push: updateQuery },
      { new: true, upsert: true }
    );
    const statusCode = saveData ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = saveData
      ? INFO_MSGS.CREATED_SUCCESSFULLY
      : ERROR_MSGS.CREATE_ERR;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: saveData || null,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  addEntry,
};
