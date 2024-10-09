const Movement = require("../../../model/movement/movement");
const TransitInfo = require("../../../model/admin/transitInfo");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { generateNumOrCharId } = require("../../../utils/generateUniqueId");
const {
  getTypeOfService_TypeOfTransportation_Pipeline,
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

    const saveData = await Movement.create(body);

    let getData = await Movement.aggregate([
      {
        $match: {
          _id: saveData._id,
        },
      },
      // Fetch port_BridgeOfCrossing
      {
        $lookup: {
          from: "specialrequirements",
          let: { port_BridgeOfCrossingId: "$port_BridgeOfCrossing" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$port_BridgeOfCrossingId"] },
              },
            },
            {
              $project: {
                _id: 0,
                post_bridge: 1,
              },
            },
          ],
          as: "port_BridgeOfCrossing",
        },
      },
      {
        $addFields: {
          port_BridgeOfCrossing: {
            $arrayElemAt: ["$port_BridgeOfCrossing.post_bridge", 0],
          },
        },
      },
      // Fetch specialrequirements
      {
        $lookup: {
          from: "specialrequirements",
          let: { specialRequirements: "$specialRequirements" },
          pipeline: [
            {
              $unwind: "$requirements",
            },
            {
              $match: {
                $expr: {
                  $in: ["$requirements._id", "$$specialRequirements"],
                },
              },
            },
            {
              $project: {
                type: "$requirements.type",
                price: "$requirements.price",
                _id: "$requirements._id",
              },
            },
          ],
          as: "specialRequirements",
        },
      },
      ...getTypeOfService_TypeOfTransportation_Pipeline(),
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
