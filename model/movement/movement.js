const { Schema, model, Types } = require("mongoose");
const { ObjectId } = Types;

const collectionSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    carrierId: {
      type: ObjectId,
      default: null,
    },
    movementId: {
      type: String,
      default: null,
      unique: true,
    },
    operatorId: {
      type: ObjectId,
    },
    vehicleId: {
      type: ObjectId,
    },
    typeOfService: {
      type: ObjectId,
      default: null,
    },
    typeOfTransportation: {
      type: ObjectId,
      default: null,
    },
    modeOfTransportation: {
      FTL: {
        type: ObjectId,
        default: null,
      },
      LTL: {
        type: ObjectId,
        default: null,
      },
    },
    port_BridgeOfCrossing: {
      type: String,
      default: null,
    },
    userReference: {
      type: String,
      default: null,
    },
    specialRequirements: {
      type: Array,
      default: null,
    },
    quantityForChains: {
      type: String,
      default: null,
    },
    quantityForStraps: {
      type: String,
      default: null,
    },
    quantityForTarps: {
      type: String,
      default: null,
    },
    restrictedTime: {
      type: String,
      default: null,
    },
    programming: {
      type: String,
      default: null,
    },
    schedule: {
      date: {
        type: String,
        default: null,
      },
      time: {
        type: String,
        default: null,
      },
    },
    qrCode: {
      type: String,
      default: null,
    },
    proofOfPhotography: {
      type: Array,
      default: null,
    },
    pickUpAddressIds: [{ type: ObjectId }],
    dropAddressIds: [{ type: ObjectId }],
    status: {
      type: String,
      default: "Pending",
      enum: ["Approved", "Completed", "InProgress", "Pending", "Cancelled"],
    },
    isAssign: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("movement", collectionSchema);