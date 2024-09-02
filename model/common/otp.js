const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    mobile: {
      type: Number,
    },
    otp: {
      type: Number,
      required: true,
    },
    isDeleted: {
      date: {
        type: Date,
        default: null,
      },
      status: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("otp", otpSchema);
