const TransitInfo = require("../../../model/common/transitInfo");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const createOrUpdate = async (req, res) => {
  let { logger, body } = req;
  try {
    let fetchData = await TransitInfo.findOne();

    let saveData;
    if (fetchData) {
      saveData = await TransitInfo.findByIdAndUpdate(fetchData._id, body, {
        new: true,
      });
    } else {
      saveData = await TransitInfo.create(body);
    }

    const statusCode = saveData ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = saveData
      ? fetchData
        ? INFO_MSGS.UPDATED_SUCCESSFULLY
        : INFO_MSGS.CREATED_SUCCESSFULLY
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
  createOrUpdate,
};
