const { Types } = require("mongoose");
const RateCard = require("../../../model/common/rateCard");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { STATUS_CODE, INFO_MSGS } = require("../../../helper/constant");

const update = async (req, res) => {
  const { logger, params, body } = req;
  try {
    const { id } = params;

    // OPTIONAL: ensure any string IDs are cast to ObjectId
    const castArray = (arr) =>
      Array.isArray(arr)
        ? arr.map(({ _id, price }) => ({ _id: new Types.ObjectId(_id), price }))
        : [];
    const sanitizedBody = {
      ...body,
      typeOfService: castArray(body.typeOfService),
      typeOfTransportation: castArray(body.typeOfTransportation),
      modeOfTransportation: castArray(body.modeOfTransportation),
      port_BridgeOfCrossing: castArray(body.port_BridgeOfCrossing),
      specialRequirements: castArray(body.specialRequirements),
    };

    const updatedData = await RateCard.findByIdAndUpdate(id, sanitizedBody, {
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

module.exports = { update };
