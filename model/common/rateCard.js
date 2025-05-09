const { Schema, model, Types } = require("mongoose");
const { ObjectId } = Types;
const collectionSchema = new Schema(
  {
    cardName: {
      type: String,
      default: null,
    },
    carrierId: {
      type: String,
      default: null,
    },
    carrierAssign: {
      type: Boolean,
      default: false,
    },
    typeOfService: [
      {
        _id: {
          type: ObjectId,
        },
        price: {
          type: Number,
          default: 0,
        },
      },
    ],
    typeOfTransportation: [
      {
        _id: {
          type: ObjectId,
        },
        price: {
          type: Number,
          default: 0,
        },
      },
    ],
    modeOfTransportation: [
      {
        _id: {
          type: ObjectId,
          default: 0,
        },
        price: {
          type: Number,
          default: 0,
        },
      },
    ],
    port_BridgeOfCrossing: [
      {
        _id: {
          type: ObjectId,
          default: 0,
        },
        price: {
          type: Number,
          default: 0,
        },
      },
    ],
    specialRequirements: [
      {
        _id: {
          type: ObjectId,
          default: 0,
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

module.exports = model("rateCard", collectionSchema);
