const Vehicle = require("../../../model/vehicle/vehicle");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const hendleStatus = async (req, res) => {
  const { logger, params, body } = req;
  try {
    const { id } = params;
    const { status } = body;

    await Vehicle.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
      }
    );

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.UPDATED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error("Error :", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  hendleStatus,
};
