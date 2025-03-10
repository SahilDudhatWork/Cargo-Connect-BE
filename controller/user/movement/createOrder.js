const Movement = require("../../../model/movement/movement");
const Payment = require("../../../model/movement/payment");
const TransitInfo = require("../../../model/admin/transitInfo");
const Coordinates = require("../../../model/common/coordinates");
const Setting = require("../../../model/common/settings");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { generateMovementId } = require("../../../utils/generateUniqueId");
const {
  sendNotificationInApp,
} = require("../../../utils/sendNotificationInApp");
const {
  sendNotificationInWeb,
} = require("../../../utils/sendNotificationInWeb");
const Notification = require("../../../model/common/notification");
const Carrier = require("../../../model/carrier/carrier");
const { ObjectId } = require("mongoose").Types;
const {
  getTypeOfService_TypeOfTransportation_Pipeline,
  addresses_Pipeline,
  port_BridgeOfCrossing_Pipeline,
  specialrequirements_Pipeline,
  users_Pipeline,
} = require("../../../utils/lookups");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

// Function to check if a point is inside the polygon
const isPointInPolygon = (point, polygon) => {
  const { lat, lng } = point;
  let isInside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [ix, iy] = polygon[i];
    const [jx, jy] = polygon[j];

    const intersect =
      iy > lng !== jy > lng && lat < ((jx - ix) * (lng - iy)) / (jy - iy) + ix;
    if (intersect) isInside = !isInside;
  }

  return isInside;
};

// Helper function to calculate price for pickup/drop addresses
const calculatePrice = (
  addresses,
  fetchCoordinates,
  basePrice,
  additionalPrice
) => {
  let highestMatchPrice = 0;
  let matchedCount = 0;
  let nonMatchedCount = 0;

  for (const address of addresses) {
    const lat = parseFloat(address.addressDetails.lat);
    const lng = parseFloat(address.addressDetails.long);
    const userLocation = { lat, lng };

    let matched = false;
    for (const coordinate of fetchCoordinates) {
      if (isPointInPolygon(userLocation, coordinate.coordinates)) {
        matched = true;
        matchedCount++;
        highestMatchPrice = Math.max(highestMatchPrice, coordinate.price);
        break;
      }
    }
    if (!matched) {
      nonMatchedCount++;
    }
  }

  // Pricing logic
  let totalMatchingPrice = 0;
  if (matchedCount > 0) {
    totalMatchingPrice += highestMatchPrice + basePrice;
  }
  if (nonMatchedCount > 0) {
    totalMatchingPrice += nonMatchedCount * additionalPrice;
  }

  return totalMatchingPrice;
};

const createOrder = async (req, res) => {
  let { logger, userId, body } = req;
  try {
    let { paymentDetail, userReference, programming, schedule } = body;

    if (userReference.length > 10) {
      return Response.error({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.USER_REFERENCE_LIMIT,
      });
    }

    if (!programming) {
      return Response.error({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: `Programming ${ERROR_MSGS.KEY_REQUIRED} Please select either 'Schedule' or 'Instant'.`,
      });
    }
    if (programming === "Schedule") {
      if (!schedule.time) {
        return Response.error({
          req,
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: `Schedule time ${ERROR_MSGS.KEY_REQUIRED}`,
        });
      }
      if (!schedule.date) {
        return Response.error({
          req,
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: `Schedule date ${ERROR_MSGS.KEY_REQUIRED}`,
        });
      }
    }

    let checkUserReferenceExist = await Movement.aggregate([
      {
        $match: { userId: new ObjectId(userId), userReference: userReference },
      },
      { $project: { _id: 1 } },
      { $limit: 1 },
    ]);

    if (checkUserReferenceExist.length > 0) {
      return Response.error({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.USER_REFERENCE_EXIST,
      });
    }

    const countMovement = await Movement.countDocuments();
    body.userId = userId;
    body.movementId = generateMovementId(countMovement);
    if (body.programming === "Instant") {
      body.isScheduleTriggered = true;
    }

    const saveData = await Movement.create(body);

    if (paymentDetail || paymentDetail?.id) {
      paymentDetail.paymentId = paymentDetail.id;
      paymentDetail.movementId = saveData._id;
      paymentDetail.userId = userId;
      await Payment.create(paymentDetail);
    }

    let getData = await Movement.aggregate([
      { $match: { _id: saveData._id } },
      ...getTypeOfService_TypeOfTransportation_Pipeline(),
      ...addresses_Pipeline(),
      ...port_BridgeOfCrossing_Pipeline(),
      ...specialrequirements_Pipeline(),
      ...users_Pipeline(),
      { $project: { __v: 0 } },
    ]);

    getData = getData[0];

    const fetchCoordinates = await Coordinates.find();
    const { coordinates } = await Setting.findOne();
    const { basePrice, additionalPrice } = coordinates;

    // Calculate prices for pickup and drop addresses
    const pickupTotal = calculatePrice(
      getData.pickUpAddressData,
      fetchCoordinates,
      basePrice,
      additionalPrice
    );
    const dropTotal = calculatePrice(
      getData.dropAddressData,
      fetchCoordinates,
      basePrice,
      additionalPrice
    );

    let totalMatchingPrice = pickupTotal + dropTotal;

    let { securingEquipment } = await TransitInfo.findOne();
    const { chains, tarps, straps } = securingEquipment;

    const additionalPricing =
      (getData.typeOfService?.price || 0) +
      (getData.typeOfTransportation?.price || 0) +
      (getData.modeOfTransportation?.price || 0) +
      (getData.quantityForChains * chains || 0) +
      (getData.quantityForStraps * tarps || 0) +
      (getData.quantityForTarps * straps || 0) +
      getData.specialRequirements.reduce(
        (total, req) => total + (req.price || 0),
        0
      );

    totalMatchingPrice += additionalPricing;

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

    const carriersDeviceToken = await Carrier.find({
      deviceToken: { $exists: true, $ne: null },
    });
    const carriersWebToken = await Carrier.find({
      webToken: { $exists: true, $ne: null },
    });

    await appNotifyCarriers(carriersDeviceToken, saveData._id);
    await webNotifyCarriers(carriersWebToken, saveData._id);

    const statusCode = saveData ? STATUS_CODE.CREATED : STATUS_CODE.BAD_REQUEST;
    const message = saveData
      ? INFO_MSGS.SEND_USER_TO_CARRIER_REQUEST
      : ERROR_MSGS.CREATE_ERR;

    return Response[statusCode === STATUS_CODE.CREATED ? "success" : "error"]({
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

const appNotifyCarriers = async (carriers, movementId) => {
  const body = "Cargo Connect";

  await Promise.all(
    carriers.map(async (carrier) => {
      try {
        const title = `Hi ${carrier.contactName}, a new movement request has been created! Are you interested in accepting it?`;
        await sendNotificationInApp(carrier.deviceToken, title, body);
      } catch (error) {
        console.error(
          `Failed to notify carrier ${carrier.contactName}:`,
          error.message
        );
      }
    })
  );

  await Notification.bulkWrite(
    carriers.map((carrier) => ({
      insertOne: {
        document: {
          movementId: movementId,
          clientRelationId: carrier._id,
          collection: "Carriers",
          title: `Hi ${carrier.contactName}, a new movement request has been created! Are you interested in accepting it?`,
          body,
        },
      },
    }))
  );
};
const webNotifyCarriers = async (carriers, movementId) => {
  const body = "Cargo Connect";

  await Promise.all(
    carriers.map(async (carrier) => {
      try {
        const title = `Hi ${carrier.contactName}, a new movement request has been created! Are you interested in accepting it?`;
        await sendNotificationInWeb(carrier.webToken, title, body);
      } catch (error) {
        console.error(
          `Failed to notify carrier ${carrier.contactName}:`,
          error.message
        );
      }
    })
  );

  await Notification.bulkWrite(
    carriers.map((carrier) => ({
      insertOne: {
        document: {
          movementId: movementId,
          clientRelationId: carrier._id,
          collection: "Carriers",
          title: `Hi ${carrier.contactName}, a new movement request has been created! Are you interested in accepting it?`,
          body,
        },
      },
    }))
  );
};
