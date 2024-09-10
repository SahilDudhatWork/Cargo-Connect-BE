const { Schema, model, Types } = require("mongoose");
const { ObjectId } = Types;

const collectionSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    addressDetails: {
      buildinName: {
        type: String,
        default: null,
      },
      postalCode: {
        type: Number,
        default: null,
      },
      laneNumber: {
        type: Number,
        default: null,
      },
      additionalDetails: {
        type: String,
        default: null,
      },
    },
    contactDetails: {
      contactName: {
        type: String,
        default: null,
      },
      contactEmail: {
        type: String,
        default: null,
      },
      contactNumber: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("address", collectionSchema);
