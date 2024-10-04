const Movement = require("../../../model/movement/movement");
const TransitInfo = require("../../../model/admin/transitInfo");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { generateNumOrCharId } = require("../../../utils/generateUniqueId");
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
      // Fetch TypeOfService
      {
        $lookup: {
          from: "transitinfos",
          let: { typeOfServiceId: "$typeOfService" },
          pipeline: [
            {
              $unwind: "$typeOfService",
            },
            {
              $match: {
                $expr: { $eq: ["$typeOfService._id", "$$typeOfServiceId"] },
              },
            },
            {
              $project: {
                _id: 0,
                title: "$typeOfService.title",
                description: "$typeOfService.description",
                price: "$typeOfService.price",
                _id: "$typeOfService._id",
              },
            },
          ],
          as: "typeOfService",
        },
      },
      {
        $unwind: {
          path: "$typeOfService",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Fetch TypeOfTransportation
      {
        $lookup: {
          from: "transitinfos",
          let: { typeOfTransportationId: "$typeOfTransportation" },
          pipeline: [
            {
              $unwind: "$typeOfTransportation",
            },
            {
              $match: {
                $expr: {
                  $eq: [
                    "$typeOfTransportation._id",
                    "$$typeOfTransportationId",
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                title: "$typeOfTransportation.title",
                description: "$typeOfTransportation.description",
                price: "$typeOfTransportation.price",
                _id: "$typeOfTransportation._id",
              },
            },
          ],
          as: "typeOfTransportation",
        },
      },
      {
        $unwind: {
          path: "$typeOfTransportation",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Fetch ModeOfTransportation
      /// FTL
      {
        $lookup: {
          from: "transitinfos",
          let: { modeOfTransportationFTLId: "$modeOfTransportation.FTL" },
          pipeline: [
            {
              $unwind: "$modeOfTransportation.FTL",
            },
            {
              $match: {
                $expr: {
                  $eq: [
                    "$modeOfTransportation.FTL._id",
                    "$$modeOfTransportationFTLId",
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                title: "$modeOfTransportation.FTL.title",
                description: "$modeOfTransportation.FTL.description",
                price: "$modeOfTransportation.FTL.price",
                _id: "$modeOfTransportation.FTL._id",
              },
            },
          ],
          as: "modeOfTransportation.FTL",
        },
      },
      {
        $addFields: {
          "modeOfTransportation.FTL": {
            $arrayElemAt: ["$modeOfTransportation.FTL", 0],
          },
        },
      },
      {
        $unwind: {
          path: "$typeOfTransportation.FTL",
          preserveNullAndEmptyArrays: true,
        },
      },
      /// LTL
      {
        $lookup: {
          from: "transitinfos",
          let: { modeOfTransportationLTLId: "$modeOfTransportation.LTL" },
          pipeline: [
            {
              $unwind: "$modeOfTransportation.LTL",
            },
            {
              $match: {
                $expr: {
                  $eq: [
                    "$modeOfTransportation.LTL._id",
                    "$$modeOfTransportationLTLId",
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                title: "$modeOfTransportation.LTL.title",
                description: "$modeOfTransportation.LTL.description",
                price: "$modeOfTransportation.LTL.price",
                _id: "$modeOfTransportation.LTL._id",
              },
            },
          ],
          as: "modeOfTransportation.LTL",
        },
      },
      {
        $addFields: {
          "modeOfTransportation.LTL": {
            $arrayElemAt: ["$modeOfTransportation.LTL", 0],
          },
        },
      },
      {
        $unwind: {
          path: "$typeOfTransportation.LTL",
          preserveNullAndEmptyArrays: true,
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
      (getData.modeOfTransportation?.FTL?.price || 0) +
      (getData.modeOfTransportation?.LTL?.price || 0) +
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
