const { Schema, model } = require("mongoose");

const collectionSchema = new Schema(
  {
    post_bridge: {
      type: String,
      default: null,
    },
    requirements: [
      {
        type: {
          type: String,
          default: null,
        },
        price: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("specialRequirements", collectionSchema);
