const Movement = require("../../../model/movement/movement");
const Carrier = require("../../../model/carrier/carrier");
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
    const { carrierId, operatorId, vehicleId, carrierReference } = body;

    if (carrierReference.length > 10) {
      return Response.error({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.CARRIER_REFERENCE_LIMIT,
      });
    }

    let checkCarrierReferenceExist = await Movement.aggregate([
      {
        $match: {
          carrierId: new ObjectId(carrierId),
          carrierReference: carrierReference,
        },
      },
      {
        $project: { _id: 1 },
      },
      {
        $limit: 1,
      },
    ]);

    if (checkCarrierReferenceExist.length > 0) {
      return Response.error({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.CARRIER_REFERENCE_EXIST,
      });
    }

    let getData = await Movement.findOne({ movementId: id });
    if (
      getData.isAssign &&
      getData?.carrierId !== null &&
      !getData?.carrierId.equals(new ObjectId(carrierId))
    ) {
      return Response.error({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ALREADY_ASSIGN,
      });
    }

    // Convert IDs to ObjectId
    body.carrierId = new ObjectId(carrierId);
    body.operatorId = new ObjectId(operatorId);
    body.vehicleId = new ObjectId(vehicleId);
    body.status = "Pending";
    body.isAssign = true;

    body.reqDocFields = getData.reqDocFields || {};
    const { companyFormationType } = await Carrier.findById(carrierId);
    if (companyFormationType === "MEXICO") {
      body.reqDocFields.Carrier = {
        ...(getData.reqDocFields?.Carrier instanceof Map
          ? Object.fromEntries(getData.reqDocFields.Carrier)
          : getData.reqDocFields?.Carrier || {}),
        cartaPorteFolio: false,
      };
    }

    // Update the Movement document
    let updateData = await Movement.findOneAndUpdate({ movementId: id }, body, {
      new: true,
    });

    const statusCode = updateData ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
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
