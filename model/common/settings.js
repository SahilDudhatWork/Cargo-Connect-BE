const { Schema, model } = require("mongoose");

const collectionSchema = new Schema(
  {
    coordinates: {
      basePrice: {
        type: Number,
      },
      additionalPrice: {
        type: Number,
      },
    },
  },
  { timestamps: true }
);

module.exports = model("setting", collectionSchema);
