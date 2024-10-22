const Movement = require("../../../model/movement/movement");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const referenceValidate = async (req, res) => {
  const { logger, body } = req;
  try {
    const { carrierId, carrierReference } = body;
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

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.SUCCESS,
    });
  } catch (error) {
    console.error("Error in referenceValidate:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  referenceValidate,
};
