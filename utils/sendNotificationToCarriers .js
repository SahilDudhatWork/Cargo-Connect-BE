const admin = require("../helper/firebaseAdmin");

const sendNotificationToCarriers = async (title, body, carriersFCMTokens) => {
  try {
    const messaging = admin.messaging();
    const message = {
      notification: {
        title,
        body,
      },
      tokens: carriersFCMTokens, // Ensure carriersFCMTokens is an array of tokens
    };
    console.log('message :>> ', message);

    const response = await messaging.send(message);
    console.log("Notifications sent successfully:", response);
  } catch (error) {
    console.error("Failed to send notifications:", error);
  }
};

module.exports = { sendNotificationToCarriers };
