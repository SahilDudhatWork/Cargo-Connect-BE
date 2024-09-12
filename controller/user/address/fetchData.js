const Address = require("../../../model/user/address");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const fetchData = async (req, res) => {
  let { logger, userId, query } = req;
  try {
    const getData = await Address.aggregate([
      { $match: { userId: new ObjectId(userId) } },
    ]);

    const statusCode = getData.length > 0 ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message =
      getData.length > 0 ? INFO_MSGS.SUCCESS : ERROR_MSGS.DATA_NOT_FOUND;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: getData,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  fetchData,
};
