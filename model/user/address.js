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
        validate: {
          validator: function (value) {
            return Number.isInteger(value);
          },
          message: "Postal code must be a valid integer", // Custom message
        },
      },
      laneNumber: {
        type: Number,
        default: null,
      },
      additionalDetails: {
        type: String,
        default: null,
      },
      lat: {
        type: String,
        default: null,
      },
      long: {
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
      countryCode: {
        type: Number,
        default: 1,
      },
      contactNumber: {
        type: String,
        default: null,
      },
    },
    addressType: {
      type: String,
      required: true,
      enum: ["PickUp", "Drop"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("address", collectionSchema);
