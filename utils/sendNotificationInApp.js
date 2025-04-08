const { google } = require("googleapis");
const path = require("path");
const axios = require("axios");

// Define the required scopes
const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];

const sendNotificationInApp = async (deviceToken, title, body, redirectUrl) => {
  const accessToken = await getAccessToken();
  const FCM_URL =
    "https://fcm.googleapis.com/v1/projects/notification-92dce/messages:send";

  const message = {
    token: deviceToken,
    notification: {
      title,
      body,
    },
    android: {
      notification: {
        icon: "stock_ticker_update",
        color: "#7e55c3",
      },
    },
  };

  if (redirectUrl) {
    message.data = { link: redirectUrl };
  }

  const payload = { message };

  try {
    const response = await axios.post(FCM_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("Notification sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending notification:", error.message);
  }
};

// Function to get an access token using the service account credentials
const getAccessToken = async () => {
  const keyPath = path.join(__dirname, "../helper/fireBaseSDK.json");
  const key = require(keyPath);

  const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    SCOPES,
    null
  );

  return new Promise((resolve, reject) => {
    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
};

module.exports = { sendNotificationInApp };
