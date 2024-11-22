const admin = require("../helper/firebaseAdmin");

const sendNotificationInWeb = async (webToken, title, body, image) => {
  try {
    webToken =
      "eGeeyFbvw_IGX8Zlr5Olai:APA91bFo-oRBZmN3xYtHJ-yZBpGLkN5TA4LB0fwzQiC1MB8jdCDZkiRSA-Dq7KSnnU_CTwNwAIUkfN46mHvinJ4UO7QeUeet0FtFJP9egCWv6ZeZj5fDTLk";

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
