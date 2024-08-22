const Movement = require("../../../model/user/movement");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const hendleRequest = async (req, res) => {
  const { logger, carrierId } = req;
  try {
    const { id } = req.params;
    const { operatorId, vehicleId } = req.body;

    // Convert IDs to ObjectId
    req.body.carrierId = new ObjectId(carrierId);
    req.body.operatorId = new ObjectId(operatorId);
    req.body.vehicleId = new ObjectId(vehicleId);
    req.body.status = "InProgress";
    req.body.isAssign = true;

    // Update the Movement document
    let updateData = await Movement.findByIdAndUpdate(
      new ObjectId(id),
      req.body,
      { new: true }
    );

    const statusCode = updateData ? STATUS_CODE.OK : STATUS_CODE.INTERNAL_ERROR;
    const message = updateData
      ? INFO_MSGS.UPDATED_SUCCESSFULLY
      : ERROR_MSGS.UPDATE_ERR;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: updateData || null,
    });
  } catch (error) {
    console.error("Error in hendleRequest:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  hendleRequest,
};
