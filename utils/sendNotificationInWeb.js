const admin = require("../helper/firebaseAdmin");

const sendNotificationInWeb = async (webToken, title, body, redirectUrl) => {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      webpush: {
        headers: {
          Urgency: "high",
        },
        notification: {},
      },
      token: webToken,
    };
    if (redirectUrl) {
      message.webpush.notification.click_action = redirectUrl;
    }

    admin
      .messaging()
      .send(message)
      .then((response) => {
        console.log("Successfully sent message:", response);
      })
      .catch((error) => {
        if (error.code === "messaging/registration-token-not-registered") {
          console.error("Invalid token:", webToken);
        }
        console.error("Error sending message:", error);
      });
  } catch (error) {
    console.error("Error sending notification:", error.message);
  }
};

module.exports = { sendNotificationInWeb };
