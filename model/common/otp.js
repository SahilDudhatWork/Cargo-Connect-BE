const { Schema, model } = require("mongoose");

const collectionSchema = new Schema(
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

module.exports = model("otp", collectionSchema);
