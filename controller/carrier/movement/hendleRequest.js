const Movement = require("../../../model/movement/movement");
const User = require("../../../model/user/user");
const Carrier = require("../../../model/carrier/carrier");
const Operator = require("../../../model/operator/operator");
const Notification = require("../../../model/common/notification");
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
  const { logger, carrierId, params, body } = req;
  try {
    const { id } = params;
    const { operatorId, vehicleId, carrierReference } = body;

    let checkCarrierReferenceExist = await Movement.aggregate([
      {
        $match: {
          carrierId: new ObjectId(carrierId),
          carrierReference,
        },
      },
      { $project: { _id: 1 } },
      { $limit: 1 },
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

    const updatedData = {
      ...body,
      carrierId: new ObjectId(carrierId),
      operatorId: new ObjectId(operatorId),
      vehicleId: new ObjectId(vehicleId),
      status: "Pending",
      isAssign: true,
    };
    let updateData = await Movement.findOneAndUpdate(
      { movementId: id },
      updatedData,
      {
        new: true,
      }
    );

    const [userData, carrierData, operatorData, notifications] =
      await getNotificationData(
        updateData.userId,
        carrierId,
        operatorId,
        updateData._id
      );

    await updateNotifications(notifications, carrierId, id);
    await sendUserNotification(userData, carrierData, updateData._id, id);
    await sendOperatorNotification(
      operatorData,
      carrierData,
      updateData._id,
      id
    );

    const statusCode = updateData
      ? STATUS_CODE.OK
      : STATUS_CODE.INTERNAL_SERVER_ERROR;
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
    Notification.aggregate([
      { $match: { movementId, collection: "Carriers" } },
    ]),
  ]);
};

const updateNotifications = async (notifications, carrierId) => {
  const bulkOperations = notifications.map((notification) =>
    notification.clientRelationId.equals(carrierId)
      ? {
          updateOne: {
            filter: { _id: notification._id },
            update: { isRead: true },
          },
        }
      : { deleteOne: { filter: { _id: notification._id } } }
  );

  if (bulkOperations.length) {
    await Notification.bulkWrite(bulkOperations);
  }
};

const sendUserNotification = async (
  userData,
  carrierData,
  movementId,
  movementAccId
) => {
  if (userData.deviceToken) {
    const body = "Cargo Connect";
    const title = `Hi ${userData.contactName}, your movement request ${movementAccId} has been approved by ${carrierData.contactName}.`;

    await Promise.all([
      sendNotificationInApp(userData.deviceToken, title, body),
      Notification.create({
        movementId,
        clientRelationId: userData._id,
        collection: "Users",
        title,
        body,
      }),
    ]);
  }
  if (userData.webToken) {
    const body = "Cargo Connect";
    const title = `Hi ${userData.contactName}, your movement request ${movementAccId} has been approved by ${carrierData.contactName}.`;

    await Promise.all([
      sendNotificationInWeb(userData.webToken, title, body),
      Notification.create({
        movementId,
        clientRelationId: userData._id,
        collection: "Users",
        title,
        body,
      }),
    ]);
  }
};

const sendOperatorNotification = async (
  operatorData,
  carrierData,
  movementId,
  movementAccId
) => {
  if (operatorData.deviceToken) {
    const body = "Cargo Connect";
    const title = `Hi ${operatorData.operatorName}, movement ${movementAccId} has been assigned by ${carrierData.contactName}.`;

    await Promise.all([
      sendNotificationInApp(operatorData.deviceToken, title, body),
      Notification.create({
        movementId,
        clientRelationId: operatorData._id,
        collection: "Operator",
        title,
        body,
      }),
    ]);
  }
  if (operatorData.webToken) {
    const body = "Cargo Connect";
    const title = `Hi ${operatorData.operatorName}, movement ${movementAccId} has been assigned by ${carrierData.contactName}.`;

    await Promise.all([
      sendNotificationInWeb(operatorData.webToken, title, body),
      Notification.create({
        movementId,
        clientRelationId: operatorData._id,
        collection: "Operator",
        title,
        body,
      }),
    ]);
  }
};
