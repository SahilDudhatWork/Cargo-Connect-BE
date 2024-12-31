const { Schema, model } = require("mongoose");

const collectionSchema = new Schema(
  {
    originalUrl: {
      type: String,
    },
    timestamp: {
      type: String,
      default: () =>
        new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
    },
    logType: {
      type: String,
      enum: ["success", "error"],
    },
    status: {
      type: Number,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = model("Logger", collectionSchema);
