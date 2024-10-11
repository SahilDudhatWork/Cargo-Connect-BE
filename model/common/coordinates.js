const { Schema, model } = require("mongoose");

const collectionSchema = new Schema(
  {
    price: {
      type: Number,
    },
    coordinates: {
      type: [[Number]], // Array of arrays with [longitude, latitude]
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("coordinates", collectionSchema);
