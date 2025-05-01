const Response = require("../../../helper/response");
const Movement = require("../../../model/movement/movement");
const { STATUS_CODE, INFO_MSGS } = require("../../../helper/constant");
const { handleException } = require("../../../helper/exception");

const verify = async (req, res) => {
  const { logger, params } = req;
  try {
    const { id } = params;

    await Movement.findOneAndUpdate(
      { movementId: id },
      { $set: { verify: true } },
      { new: true }
    );

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.VERIFY_SUCCESSFULLY,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  verify,
};
