const Movement = require("../../../model/movement/movement");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { handleException } = require("../../../helper/exception");

const fetchQr = async (req, res) => {
  const { logger, params } = req;
  try {
    const fetchMovement = await Movement.findById(
      {
        _id: params.movementId,
      },
      { proofOfPhotography: 1, qrCode: 1 }
    );
    return Response.success({
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.SUCCESS,
      data: fetchMovement,
    });
  } catch (error) {
    console.error("Error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  fetchQr,
};
