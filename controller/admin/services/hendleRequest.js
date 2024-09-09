const Movement = require("../../../model/movement/movement");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const hendleRequest = async (req, res) => {
  const { logger, params, body } = req;
  try {
    const { id } = params;
    const { carrierId, operatorId, vehicleId } = body;

    // Convert IDs to ObjectId
    body.carrierId = new ObjectId(carrierId);
    body.operatorId = new ObjectId(operatorId);
    body.vehicleId = new ObjectId(vehicleId);
    body.status = "InProgress";
    body.isAssign = true;

    // Update the Movement document
    let updateData = await Movement.findOneAndUpdate({ movementId: id }, body, {
      new: true,
    });

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
