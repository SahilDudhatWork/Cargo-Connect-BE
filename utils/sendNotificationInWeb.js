const admin = require("../helper/firebaseAdmin");

const sendNotificationInWeb = async (webToken, title, body, image) => {
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
        notification: {
          click_action: "https://mycargoconnects.com/",
        },
      },
      token: webToken,
    };

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
