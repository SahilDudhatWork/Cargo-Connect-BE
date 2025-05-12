const RateCard = require("../../../model/common/rateCard");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  INFO_MSGS,
  ERROR_MSGS,
} = require("../../../helper/constant");

const carrierAssign = async (req, res) => {
  const { logger, params } = req;
  try {
    const { id, carrierAccId } = params;

    const checkAlreadyAssign = await RateCard.findOne({
      carrierId: carrierAccId,
    });
    if (checkAlreadyAssign) {
      await RateCard.findByIdAndUpdate(
        checkAlreadyAssign._id,
        { carrierId: null, carrierAssign: false },
        { new: true }
      );
    }
    const updatedData = await RateCard.findByIdAndUpdate(
      id,
      { carrierId: carrierAccId, carrierAssign: true },
      { new: true }
    );

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
  carrierAssign,
};
