const CarrierRole = require("../../../model/carrier/carrierRole");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const create = async (req, res) => {
  const { logger, body } = req;
  try {
    const { roleTitle } = body;
    const checkDuplicate = await CarrierRole.findOne({ roleTitle });

    if (checkDuplicate) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: `roleTitle ${ERROR_MSGS.DATA_EXISTS}`,
      };
      return Response.success(obj);
    }
    const saveData = await CarrierRole.create(body);

    const obj = {
      res,
      status: STATUS_CODE.CREATED,
      msg: INFO_MSGS.CREATED_SUCCESSFULLY,
      data: saveData,
    };
    return Response.success(obj);
  } catch (error) {
    console.log("error--->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  create,
};
