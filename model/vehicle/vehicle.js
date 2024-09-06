const { Schema, model, Types } = require("mongoose");
const { ObjectId } = Types;

const collectionSchema = new Schema(
  {
    carrierId: {
      type: ObjectId,
      required: true,
    },
    vehicleName: {
      type: String,
      lowercase: true,
      default: null,
    },
    mxPlates: {
      type: String,
      default: null,
    },
    mxPlatesExpirationDate: {
      type: Date,
      default: null,
    },
    usPlates: {
      type: String,
      default: null,
    },
    usPlatesExpirationDate: {
      type: Date,
      default: null,
    },
    mxInsurancePlates: {
      type: String,
      default: null,
    },
    mxInsurancePlatesExpirationDate: {
      type: Date,
      default: null,
    },
    usInsurancePlates: {
      type: String,
      default: null,
    },
    usInsurancePlatesExpirationDate: {
      type: Date,
      default: null,
    },
    typeOfService: [
      {
        type: ObjectId,
      },
    ],
    typeOfTransportation: [
      {
        type: ObjectId,
      },
    ],
    modeOfTransportation: {
      FTL: [
        {
          type: ObjectId,
        },
      ],
      LTL: [
        {
          type: ObjectId,
        },
      ],
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Deactive"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("vehicle", collectionSchema);
