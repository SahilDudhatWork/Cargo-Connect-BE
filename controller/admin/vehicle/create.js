const Vehicle = require("../../../model/vehicle/vehicle");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const create = async (req, res) => {
  const { logger } = req;
  try {
    let saveData = await Vehicle.create(req.body);

    if (!req.body.carrierId) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: `carrierId ${ERROR_MSGS.KEY_REQUIRED}`,
      };
      return Response.error(obj);
    }

    const statusCode = saveData ? STATUS_CODE.CREATED : STATUS_CODE.BAD_REQUEST;
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
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  create,
};
