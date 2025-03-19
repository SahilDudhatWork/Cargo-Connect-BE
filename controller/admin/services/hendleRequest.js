const Movement = require("../../../model/movement/movement");
const User = require("../../../model/user/user");
const Admin = require("../../../model/admin/admin");
const Carrier = require("../../../model/carrier/carrier");
const Operator = require("../../../model/operator/operator");
const Notification = require("../../../model/common/notification");
const { sendNotification } = require("../../../utils/nodemailer");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const {
  sendNotificationInApp,
} = require("../../../utils/sendNotificationInApp");
const {
  sendNotificationInWeb,
} = require("../../../utils/sendNotificationInWeb");
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
    const [userData, carrierData, operatorData, admins] =
      await getNotificationData(
        updateData.userId,
        carrierId,
        operatorId,
        updateData._id
      );

    await sendUserLoadAcceptedNotification(userData, updateData._id);
    await sendUserDriverAssignedNotification(
      userData,
      operatorData,
      updateData._id
    );
    await sendOperatorNewLoadAssignedNotification(operatorData, updateData._id);
    await sendCarrierDriverAssignedNotification(carrierData, updateData._id);
    await sendAdminLoadsAcceptedByCarriersNotification(
      admins,
      carrierData,
      updateData._id
    );

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

const getNotificationData = async (
  userId,
  carrierId,
  operatorId,
  movementId
) => {
  return await Promise.all([
    User.findById(userId),
    Carrier.findById(carrierId),
    Operator.findById(operatorId),
    Admin.find(),
  ]);
};

// Load Accepted Notification
const sendUserLoadAcceptedNotification = async (userData, movementId) => {
  const body = "Cargo Connect";
  const title = `Hi ${userData.contactName}, Your service has been accepted by a carrier. You will receive the operator's details shortly.`;

  const notificationTasks = [];

  if (userData.deviceToken) {
    notificationTasks.push(
      sendNotificationInApp(userData.deviceToken, title, body)
    );
  }
  if (userData.webToken) {
    notificationTasks.push(
      sendNotificationInWeb(userData.webToken, title, body)
    );
  }
  if (userData.deviceToken || userData.webToken) {
    notificationTasks.push(
      Notification.create({
        movementId,
        clientRelationId: userData._id,
        collection: "Users",
        title,
        body,
      })
    );
  }

  notificationTasks.push(
    sendNotification(
      userData.email,
      title,
      userData.contactName,
      "Load Accepted"
    )
  );

  await Promise.all(notificationTasks);
};

// Driver Assigned Notification
const sendUserDriverAssignedNotification = async (
  userData,
  operator,
  movementId
) => {
  const body = "Cargo Connect";
  const title = `Hi ${userData.contactName}, A driver has been assigned to your service. ${operator.operatorName} will arrive in approximately [ETA].`;

  const notificationTasks = [];

  if (userData.deviceToken) {
    notificationTasks.push(
      sendNotificationInApp(userData.deviceToken, title, body)
    );
  }
  if (userData.webToken) {
    notificationTasks.push(
      sendNotificationInWeb(userData.webToken, title, body)
    );
  }
  if (userData.deviceToken || userData.webToken) {
    notificationTasks.push(
      Notification.create({
        movementId,
        clientRelationId: userData._id,
        collection: "Users",
        title,
        body,
      })
    );
  }

  notificationTasks.push(
    sendNotification(
      userData.email,
      title,
      userData.contactName,
      "Driver Assigned"
    )
  );

  await Promise.all(notificationTasks);
};

// New Load Assigned Notification
const sendOperatorNewLoadAssignedNotification = async (
  operatorData,
  movementId
) => {
  const body = "Cargo Connect";
  const title = `Hi ${operatorData.operatorName}, You have a new service: [Origin → Destination]. Pickup time: [Date & Time].`;

  const notificationTasks = [];

  if (operatorData.deviceToken) {
    notificationTasks.push(
      sendNotificationInApp(operatorData.deviceToken, title, body)
    );
  }
  if (operatorData.webToken) {
    notificationTasks.push(
      sendNotificationInWeb(operatorData.webToken, title, body)
    );
  }
  if (operatorData.deviceToken || operatorData.webToken) {
    await Notification.create({
      movementId,
      clientRelationId: operatorData._id,
      collection: "Operators",
      title,
      body,
    });

    // Schedule a reminder message after 10 minutes
    setTimeout(
      async () => {
        const reminderTitle = `Hi ${operatorData.operatorName}, Your service is confirmed! Remember to pick up the load as scheduled and share your location for tracking.`;

        const reminderTasks = [];
        if (operatorData.deviceToken) {
          reminderTasks.push(
            sendNotificationInApp(operatorData.deviceToken, reminderTitle, body)
          );
        }
        if (operatorData.webToken) {
          reminderTasks.push(
            sendNotificationInWeb(operatorData.webToken, reminderTitle, body)
          );
        }
        if (operatorData.deviceToken || operatorData.webToken) {
          reminderTasks.push(
            Notification.create({
              movementId,
              clientRelationId: operatorData._id,
              collection: "Operators",
              title: reminderTitle,
              body: body,
            })
          );
        }

        await Promise.all(reminderTasks);
      },
      10 * 60 * 1000
    ); // 10 minutes delay
  }

  await Promise.all(notificationTasks);
};

// Driver Assigned Notification
const sendCarrierDriverAssignedNotification = async (
  carrierData,
  movementId
) => {
  const body = "Cargo Connect";
  const title = `Hi ${carrierData.contactName}, You have a new service: [Origin → Destination]. Pickup time: [Date & Time].`;

  const notificationTasks = [];

  if (carrierData.deviceToken) {
    notificationTasks.push(
      sendNotificationInApp(carrierData.deviceToken, title, body)
    );
  }
  if (carrierData.webToken) {
    notificationTasks.push(
      sendNotificationInWeb(carrierData.webToken, title, body)
    );
  }
  if (carrierData.deviceToken || carrierData.webToken) {
    notificationTasks.push(
      Notification.create({
        movementId,
        clientRelationId: carrierData._id,
        collection: "Carriers",
        title,
        body,
      })
    );
  }
  notificationTasks.push(
    sendNotification(
      carrierData.email,
      title,
      carrierData.contactName,
      "New Load Assigned"
    )
  );

  await Promise.all(notificationTasks);
};
