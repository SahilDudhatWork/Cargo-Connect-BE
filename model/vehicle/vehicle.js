const { Schema, model, Types } = require("mongoose");
const { ObjectPlates } = Types;

const collectionSchema = new Schema(
  {
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
        title: {
          type: String,
          default: null,
        },
        description: {
          type: String,
          default: null,
        },
      },
    ],
    typeOfTransportation: [
      {
        title: {
          type: String,
          default: null,
        },
        description: {
          type: String,
          default: null,
        },
      },
    ],
    modeOfTransportation: {
      FTL: [
        {
          title: {
            type: String,
            default: null,
          },
          description: {
            type: String,
            default: null,
          },
        },
      ],
      LTL: [
        {
          title: {
            type: String,
            default: null,
          },
          description: {
            type: String,
            default: null,
          },
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