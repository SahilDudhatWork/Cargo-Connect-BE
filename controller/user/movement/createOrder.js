const Movement = require("../../../model/movement/movement");
const Payment = require("../../../model/movement/payment");
const TransitInfo = require("../../../model/admin/transitInfo");
const Coordinates = require("../../../model/common/coordinates");
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

// Function to check if a point is inside the polygon
const isPointInPolygon = (point, polygon) => {
  let inside = false;
  const { lat, lng } = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1],
      yi = polygon[i][0]; // Lat, Long
    const xj = polygon[j][1],
      yj = polygon[j][0]; // Lat, Long

    const intersect =
      yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

const createOrder = async (req, res) => {
  let { logger, userId, body } = req;
  try {
    let { paymentDetail } = body;

    if (!paymentDetail) {
      return Response.error({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: `paymentDetail ${ERROR_MSGS.KEY_REQUIRED}`,
      });
    }

    body.userId = userId;
    body.movementId = generateNumOrCharId();
    if (body.programming === "Instant") {
      body.isScheduleTriggered = true;
    }

    const saveData = await Movement.create(body);

    paymentDetail.paymentId = paymentDetail.id;
    paymentDetail.movementId = saveData._id;
    paymentDetail.userId = userId;

    await Payment.create(paymentDetail);

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

    // Fetch coordinates from the database
    const fetchCoordinates = await Coordinates.find();

    // Initialize total matching price
    let totalMatchingPrice = 50;

    // Check prices for each pickup address
    for (const pickUpAddress of getData.pickUpAddressData) {
      const pickUpLat = parseFloat(pickUpAddress.addressDetails.lat);
      const pickUpLong = parseFloat(pickUpAddress.addressDetails.long);
      const userSelectedLocation = { lat: pickUpLat, lng: pickUpLong };

      for (const coordinate of fetchCoordinates) {
        if (isPointInPolygon(userSelectedLocation, coordinate.coordinates)) {
          totalMatchingPrice += coordinate.price;
          break;
        }
      }
    }

    // // Check prices for each drop address
    // for (const dropAddress of getData.dropAddressData) {
    //   const dropLat = parseFloat(dropAddress.addressDetails.lat);
    //   const dropLong = parseFloat(dropAddress.addressDetails.long);
    //   const userSelectedLocation = { lat: dropLat, lng: dropLong };

    //   for (const coordinate of fetchCoordinates) {
    //     if (isPointInPolygon(userSelectedLocation, coordinate.coordinates)) {
    //       totalMatchingPrice += coordinate.price;
    //       break;
    //     }
    //   }
    // }

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

    totalMatchingPrice += totalPrice;

    // Amount details
    let amountDetails = {
      price: totalMatchingPrice,
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
