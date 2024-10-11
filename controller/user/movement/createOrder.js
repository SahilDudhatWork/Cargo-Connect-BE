const Movement = require("../../../model/movement/movement");
const TransitInfo = require("../../../model/admin/transitInfo");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { generateNumOrCharId } = require("../../../utils/generateUniqueId");
const {
  getTypeOfService_TypeOfTransportation_Pipeline,
  userReference_Pipeline,
  addresses_Pipeline,
  port_BridgeOfCrossing_Pipeline,
  specialrequirements_Pipeline,
} = require("../../../utils/lookups");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const createOrder = async (req, res) => {
  let { logger, userId, body } = req;
  try {
    body.userId = userId;
    body.movementId = generateNumOrCharId();
    if ((body.programming = "Instant")) {
      body.isScheduleTriggered = true;
    }

    const saveData = await Movement.create(body);

    let getData = await Movement.aggregate([
      {
        $match: {
          _id: saveData._id,
        },
      },
      ...getTypeOfService_TypeOfTransportation_Pipeline(),
      ...userReference_Pipeline(),
      ...addresses_Pipeline(),
      ...port_BridgeOfCrossing_Pipeline(),
      ...specialrequirements_Pipeline(),
      {
        $project: {
          __v: 0,
        },
      },
    ]);

    getData = getData[0];

    let { securingEquipment } = await TransitInfo.findOne();
    const { chains, tarps, straps } = securingEquipment;

    const totalPrice =
      (getData.typeOfService?.price || 0) +
      (getData.typeOfTransportation?.price || 0) +
      (getData.modeOfTransportation?.price || 0) +
      (getData.quantityForChains * chains || 0) +
      (getData.quantityForStraps * tarps || 0) +
      (getData.quantityForTarps * straps || 0) +
      getData?.specialRequirements.reduce(
        (total, requirement) => total + (requirement.price || 0),
        0
      );

    let amountDetails = {
      price: totalPrice,
      currency: "$",
      paymentMode: "Cash",
    };

    getData.amountDetails = amountDetails;
    await Movement.updateOne(
      { _id: saveData._id },
      { $set: { amountDetails } }
    );

    const statusCode = saveData ? STATUS_CODE.CREATED : STATUS_CODE.CREATED;
    const message = saveData
      ? INFO_MSGS.SEND_USER_TO_CARRIER_REQUEST
      : ERROR_MSGS.CREATE_ERR;
    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: getData,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  createOrder,
};
