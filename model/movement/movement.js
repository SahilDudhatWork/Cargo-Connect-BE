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
    amountDetails: {
      price: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
      },
      paymentMode: {
        type: String,
      },
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
      type: ObjectId,
      default: null,
    },
    port_BridgeOfCrossing: {
      type: ObjectId,
    },
    userReference: {
      type: String,
      default: null,
    },
    carrierReference: {
      type: String,
      default: null,
    },
    specialRequirements: [
      {
        type: ObjectId,
        default: null,
      },
    ],
    quantityForChains: {
      type: Number,
      default: null,
    },
    quantityForStraps: {
      type: Number,
      default: null,
    },
    quantityForTarps: {
      type: Number,
      default: 0,
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
    documents: {
      type: Array,
      default: null,
    },
    pickUpAddressIds: [{ type: ObjectId }],
    dropAddressIds: [{ type: ObjectId }],
    status: {
      type: String,
      default: "NewAssignments",
      enum: [
        "Completed",
        "InProgress",
        "Pending",
        "Cancelled",
        "NewAssignments",
      ],
    },
    isScheduleTriggered: {
      type: Boolean,
      default: false,
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
