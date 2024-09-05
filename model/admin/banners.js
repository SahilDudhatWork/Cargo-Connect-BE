const { Schema, model } = require("mongoose");

const collectionSchema = new Schema(
  {
    user: {
      mainBanner: {
        type: String,
        default: null,
      },
      serviceBanner: {
        type: String,
        default: null,
      },
      operationsBanner: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("banners", collectionSchema);
