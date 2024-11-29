const { Schema, model } = require("mongoose");

const collectionSchema = new Schema(
  {
    menuTitle: {
      type: String,
      trim: true,
    },
    to: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = model("carreirMenuAccess", collectionSchema);
