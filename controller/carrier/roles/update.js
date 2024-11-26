const CarrierRole = require("../../../model/carrier/carrierRole");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const update = async (req, res) => {
  const { logger, params, body } = req;
  try {
    const { id } = params;
    const { roleTitle } = body;
    
    if (roleTitle) {
      const checkDuplicate = await CarrierRole.findOne({ roleTitle });

      if (checkDuplicate) {
        const obj = {
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: `roleTitle ${ERROR_MSGS.DATA_EXISTS}`,
        };
        return Response.success(obj);
      }
    }

    const updatedData = await CarrierRole.findByIdAndUpdate(id, body, {
      new: true,
    });

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.UPDATED_SUCCESSFULLY,
      data: updatedData,
    });
  } catch (error) {
    console.error("Error :", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  update,
};
