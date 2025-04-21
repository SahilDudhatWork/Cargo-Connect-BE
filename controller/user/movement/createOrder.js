const Movement = require("../../../model/movement/movement");
const User = require("../../../model/user/user");
const Admin = require("../../../model/admin/admin");
const Carrier = require("../../../model/carrier/carrier");
const Notification = require("../../../model/common/notification");
const Payment = require("../../../model/movement/payment");
const TransitInfo = require("../../../model/admin/transitInfo");
const Coordinates = require("../../../model/common/coordinates");
const Setting = require("../../../model/common/settings");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { generateMovementId } = require("../../../utils/generateUniqueId");
const { sendNotification } = require("../../../utils/nodemailer");
const {
  sendNotificationInApp,
} = require("../../../utils/sendNotificationInApp");
const {
  sendNotificationInWeb,
} = require("../../../utils/sendNotificationInWeb");
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
  const addLength = addresses.length;

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
    if (nonMatchedCount === 1 && addLength === 1) {
      totalMatchingPrice += nonMatchedCount * basePrice;
    } else {
      totalMatchingPrice += nonMatchedCount * additionalPrice;
    }
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

    let reqDocFields = { User: {}, Carrier: {} };
    const {
      typeOfService,
      specialRequirements = [],
      typeOfTransportation,
      modeOfTransportation,
    } = getData;

    const serviceTitle = typeOfService?.title;
    const isNorthOrSouth = ["Northbound Service", "Southbound"].includes(
      serviceTitle
    );
    const isSouthbound = serviceTitle === "Southbound";
    const isNorthbound = serviceTitle === "Northbound Service";

    const userConditions = [
      {
        fields: ["cartaPorte", "doda", "letterWithInstructionsMemo"],
        condition: isNorthOrSouth,
      },
      { fields: ["entryPrefileInbond"], condition: isNorthbound },
      { fields: ["itnInbondNoItnNeeded"], condition: isSouthbound },
      {
        fields: ["intercambioTrailerRelease"],
        condition: typeOfTransportation?.title === "FTL",
      },
      {
        fields: ["oversizeNotificationUser"],
        condition: isNorthOrSouth,
        special: "Over Size",
      },
      {
        fields: ["overweightPermit"],
        condition: isNorthOrSouth,
        special: "Over Weight",
      },
      {
        fields: ["overweightNotification"],
        condition: isNorthOrSouth,
        special: "Over Weight",
      },
      {
        fields: ["hazmatBol", "hazmatSdsSafetyDataSheet"],
        condition: isNorthOrSouth,
        special: "Hazmat (USD405)",
      },
      {
        fields: ["sagarpaPackageAgriculture"],
        condition: isNorthOrSouth,
        special: "Profepa Inspection MX (USD 45)",
      },
      {
        fields: ["profepaPackageEnvironmental"],
        condition: isNorthOrSouth,
        special: "Sagarpa Inspection MX (USD 45)",
      },
      {
        fields: ["sedenaPackage"],
        condition: isSouthbound,
        special: "Sedena Inspection MX (USD 0)",
      },
      {
        fields: ["cuadernoAta"],
        condition: isNorthOrSouth,
      },
      {
        fields: ["informalExport"],
        condition: isNorthbound,
      },
    ];
    const carrierConditions = [
      { fields: ["aceEManifest"], condition: isNorthOrSouth },
      {
        fields: ["oversizePermitCarrier"],
        condition: true,
        special: "Over Size",
      },
      {
        fields: ["overweightPermit"],
        condition: isNorthOrSouth,
        special: "Over Weight",
      },
      {
        fields: ["temperatureControlIn", "temperatureControlOut"],
        condition: modeOfTransportation?.title === "Reefer",
      },
    ];

    userConditions.forEach(({ fields, condition, special }) => {
      if (
        condition &&
        (!special ||
          specialRequirements.some((req) => req.type.includes(special)))
      ) {
        fields.forEach((field) => (reqDocFields.User[field] = false));
      }
    });
    carrierConditions.forEach(({ fields, condition, special }) => {
      if (
        condition &&
        (!special ||
          specialRequirements.some((req) => req.type.includes(special)))
      ) {
        fields.forEach((field) => (reqDocFields.Carrier[field] = false));
      }
    });

    await Movement.updateOne(
      { _id: saveData._id },
      {
        $set: {
          amountDetails,
          "reqDocFields.User": { ...reqDocFields.User },
          "reqDocFields.Carrier": { ...reqDocFields.Carrier },
        },
      }
    );

    const carriers = await Carrier.find({
      $or: [
        { deviceToken: { $exists: true, $ne: null } },
        { webToken: { $exists: true, $ne: null } },
      ],
    });
    const admins = await Admin.find();

    const userDetails = await User.findById(userId);

    await notifyCarriers(carriers, saveData._id, amountDetails.price);
    await notifyUser(userDetails, saveData._id);
    await notifyAdmin(admins, saveData._id, getData.movementId);

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

const notifyCarriers = async (carriers, movementId, amount) => {
  const body = "Cargo Connect";
  const successfulNotifications = new Map();

  await Promise.all(
    carriers.map(async (carrier) => {
      const title = `Hi ${carrier?.contactName}, New service is available: [Origin → Destination] for [${amount}]. Accept before another carrier accepts.`;

      let notified = false;

      try {
        if (carrier?.deviceToken) {
          await sendNotificationInApp(carrier?.deviceToken, title, body);
          notified = true;
        }

        if (carrier?.webToken) {
          await sendNotificationInWeb(carrier?.webToken, title, body);
          notified = true;
        }

        // Store only unique carriers in the map to avoid duplicates
        if (notified && !successfulNotifications.has(carrier._id)) {
          successfulNotifications.set(carrier._id, { carrier, title });
        }
      } catch (error) {
        console.error(
          `Failed to notify carrier ${carrier?.contactName}:`,
          error?.message
        );
      }
    })
  );

  if (successfulNotifications.size > 0) {
    await Notification.bulkWrite(
      Array.from(successfulNotifications.values()).map(
        ({ carrier, title }) => ({
          insertOne: {
            document: {
              movementId,
              clientRelationId: carrier._id,
              collection: "Carriers",
              title,
              body,
            },
          },
        })
      )
    );
  }
};

const notifyAdmin = async (admins, movementId, movementAccId) => {
  const body = "Cargo Connect";
  const successfulNotifications = new Map();

  await Promise.all(
    admins.map(async (admin) => {
      const title = `Hi ${admin?.contactName}, A new service request has been received, there are (${movementAccId}). Searching for carriers is in progress.`;

      let notified = false;

      try {
        if (admin?.deviceToken) {
          await sendNotificationInApp(admin?.deviceToken, title, body);
          notified = true;
        }

        if (admin?.webToken) {
          await sendNotificationInWeb(admin?.webToken, title, body);
          notified = true;
        }

        // Store only unique admins in the map to avoid duplicates
        if (notified && !successfulNotifications.has(admin._id)) {
          successfulNotifications.set(admin._id, { admin, title });
        }
      } catch (error) {
        console.error(
          `Failed to notify admin ${admin?.contactName}:`,
          error.message
        );
      }
      await sendNotification(
        admin?.email,
        title,
        admin?.contactName,
        "New Load Request Received"
      );
    })
  );

  if (successfulNotifications.size > 0) {
    await Notification.bulkWrite(
      Array.from(successfulNotifications.values()).map(
        ({ carrier, title }) => ({
          insertOne: {
            document: {
              movementId,
              clientRelationId: carrier._id,
              collection: "Carriers",
              title,
              body,
            },
          },
        })
      )
    );
  }
};

const notifyUser = async (user, movementId) => {
  const body = "Cargo Connect";
  const title = `Hi ${user?.contactName}, We have received your service request. We are looking for available carriers.`;

  try {
    if (user?.deviceToken) {
      await sendNotificationInApp(user?.deviceToken, title, body);
    } else if (user?.webToken) {
      await sendNotificationInWeb(user?.webToken, title, body);
    } else {
      console.error(`No valid notification token for ${user?.contactName}`);
      return;
    }
  } catch (error) {
    console.error(`Failed to notify ${user?.contactName}:`, error.message);
  }
  await sendNotification(
    user?.email,
    title,
    user?.contactName,
    "Request Received"
  );

  await Notification.create({
    movementId,
    clientRelationId: user._id,
    collection: "Users",
    title,
    body,
  });
};
