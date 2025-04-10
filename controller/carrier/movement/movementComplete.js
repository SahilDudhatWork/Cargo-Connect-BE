const Movement = require("../../../model/movement/movement");
const User = require("../../../model/user/user");
const Operator = require("../../../model/operator/operator");
const Admin = require("../../../model/admin/admin");
const Notification = require("../../../model/common/notification");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { sendNotification } = require("../../../utils/nodemailer");

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

const movementComplete = async (req, res) => {
  const { logger, params } = req;
  try {
    const { id } = params;
    let updateData = await Movement.findOneAndUpdate(
      { movementId: id },
      { status: "Completed" },
      { new: true }
    );

    const [userData, operatorData, admins] = await getNotificationData(
      updateData.userId,
      updateData.operatorId
    );

    await sendUserDeliveryCompletedNotification(
      userData,
      updateData._id,
      updateData.movementId
    );
    await sendOperatorDeliveryCompletedNotification(
      operatorData,
      updateData._id,
      updateData.movementId
    );
    await sendAdminLoadDeliveredSuccessfullyNotification(
      admins,
      updateData._id,
      updateData.movementId
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
    console.error("Error in movementComplete:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  movementComplete,
};

const getNotificationData = async (userId, operatorId) => {
  return await Promise.all([
    User.findById(userId),
    Operator.findById(operatorId),
    Admin.find(),
  ]);
};

// Delivery Completed Notification
const sendUserDeliveryCompletedNotification = async (
  userData,
  movementId,
  movementAccId
) => {
  const body = "Cargo Connect";
  const redirectUrl = `https://mycargoconnects.com/my-orders/service/${movementAccId}`;
  const title = `Hi ${userData?.contactName}, Your load has been successfully delivered. Thank you for trusting us!`;

  const notificationTasks = [];

  if (userData?.deviceToken) {
    notificationTasks.push(
      sendNotificationInApp(userData?.deviceToken, title, body, redirectUrl)
    );
  }
  if (userData?.webToken) {
    notificationTasks.push(
      sendNotificationInWeb(userData?.webToken, title, body, redirectUrl)
    );
  }
  if (userData?.deviceToken || userData?.webToken) {
    notificationTasks.push(
      Notification.create({
        movementId,
        clientRelationId: userData._id,
        collection: "Users",
        title,
        body,
        redirectUrl,
      })
    );
  }

  notificationTasks.push(
    sendNotification(
      userData?.email,
      title,
      userData?.contactName,
      "Delivery Completed"
    )
  );

  await Promise.all(notificationTasks);
};

// Delivery Confirmed Notification
const sendOperatorDeliveryCompletedNotification = async (
  operatorData,
  movementId,
  movementAccId
) => {
  const body = "Cargo Connect";
  const redirectUrl = `https://mycargoconnects.com/my-orders/service/${movementAccId}`;
  const title = `Hi ${operatorData?.operatorName}, Load delivered. Great job!`;

  const notificationTasks = [];

  if (operatorData?.deviceToken) {
    notificationTasks.push(
      sendNotificationInApp(operatorData?.deviceToken, title, body, redirectUrl)
    );
  }
  if (operatorData?.webToken) {
    notificationTasks.push(
      sendNotificationInWeb(operatorData?.webToken, title, body, redirectUrl)
    );
  }
  if (operatorData?.deviceToken || operatorData?.webToken) {
    notificationTasks.push(
      Notification.create({
        movementId,
        clientRelationId: operatorData._id,
        collection: "Operators",
        title,
        body,
        redirectUrl,
      })
    );
  }

  await Promise.all(notificationTasks);
};

// Load Delivered Successfully Notification
const sendAdminLoadDeliveredSuccessfullyNotification = async (
  admins,
  movementId,
  movementAccId
) => {
  await Promise.all(
    admins.map(async (admin) => {
      const body = "Cargo Connect";
      const title = `Hi ${admin?.contactName}, (${movementAccId}) Successfully delivered services`;

      const notificationTasks = [];

      if (admin?.deviceToken) {
        notificationTasks.push(
          sendNotificationInApp(admin?.deviceToken, title, body)
        );
      }
      if (admin?.webToken) {
        notificationTasks.push(
          sendNotificationInWeb(admin?.webToken, title, body)
        );
      }
      if (admin?.deviceToken || admin?.webToken) {
        notificationTasks.push(
          Notification.create({
            movementId,
            clientRelationId: admin._id,
            collection: "Admins",
            title,
            body,
          })
        );
      }
      notificationTasks.push(
        sendNotification(
          admin?.email,
          title,
          admin?.contactName,
          "Load Delivered Successfully"
        )
      );

      await Promise.all(notificationTasks);
    })
  );
};
