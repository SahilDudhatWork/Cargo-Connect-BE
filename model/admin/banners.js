const { Schema, model } = require("mongoose");

const collectionSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["User", "Carrier", "Operator"],
    },
    banners: [
      {
        image: {
          type: String,
        },
        link: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = model("banners", collectionSchema);
