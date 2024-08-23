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
      title: {
        type: String,
        default: null,
      },
      description: {
        type: String,
        default: null,
      },
    },
    typeOfTransportation: {
      title: {
        type: String,
        default: null,
      },
      description: {
        type: String,
        default: null,
      },
    },
    modeOfTransportation: {
      title: {
        type: String,
        default: null,
      },
      description: {
        type: String,
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
    pickUpAddressIds: [{ type: ObjectId }],
    dropAddressIds: [{ type: ObjectId }],
    status: {
      type: String,
      default: "Pending",
      enum: ["Approved", "Completed", "InProgress", "Pending"],
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
