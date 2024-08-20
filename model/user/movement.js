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
        type: Number,
        default: null,
      },
    },
    pickUpDetails: [
      {
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
            type: Number,
            default: null,
          },
        },
      },
    ],
    dropDetails: [
      {
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
            type: Number,
            default: null,
          },
        },
      },
    ],
    status: {
      type: String,
      default: "InProgress",
      enum: ["Approved", "Completed", "InProgress"],
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
