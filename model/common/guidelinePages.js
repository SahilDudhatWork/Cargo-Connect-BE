const { Schema, model } = require("mongoose");

const collectionSchema = new Schema(
  {
    type: {
      type: String,
    },
    title: {
      type: String,
    },
    subTitle: {
      type: String,
    },
    description: {
      type: String,
    },
    role: {
      type: String,
      enum: ["User", "Carrier", "Operator"],
    },
  },
  { timestamps: true }
);

module.exports = model("GuidelinePages", collectionSchema);
