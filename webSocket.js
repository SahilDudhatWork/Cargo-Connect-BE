const Notification = require("./model/common/notification");
const WebSocket = require("ws");
const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const connectedClients = new Map();

// WebSocket connection handler
wss.on("connection", (ws, req) => {
  const userId = req.url.split("/").pop();
  connectedClients.set(userId, ws);
  console.log(`User ${userId} connected`);

  ws.on("close", () => {
    console.log(`User ${userId} disconnected`);
    connectedClients.delete(userId);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Function to send notification to a specific user
function sendNotificationToUser(userId, notificationData) {
  const client = connectedClients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(notificationData));
  } else {
    console.log(`User ${userId} is not connected.`);
  }
}

// Function to create and send notifications
async function notifyUser(userId, title, body) {
  const notification = await Notification.create({
    userId,
    title,
    body,
  });

  sendNotificationToUser(userId, {
    type: "NEW_NOTIFICATION",
    data: {
      id: notification._id,
      title,
      body,
      userId,
      currentDateTime: new Date().toLocaleString(),
    },
  });
}

// Start server
server.listen(3000, () => {
  console.log("WebSocket server is running on ws://localhost:3000");
});

module.exports = notifyUser;
