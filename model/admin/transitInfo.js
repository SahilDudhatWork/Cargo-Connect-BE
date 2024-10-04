const { Schema, model, Types } = require("mongoose");
const { ObjectId } = Types;

const collectionSchema = new Schema(
  {
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
        price: {
          type: Number,
          default: 0,
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
        price: {
          type: Number,
          default: 0,
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
          price: {
            type: Number,
            default: 0,
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
          price: {
            type: Number,
            default: 0,
          },
        },
      ],
    },
    securingEquipment: {
      chains: {
        type: Number,
        default: 0,
      },
      tarps: {
        type: Number,
        default: 0,
      },
      straps: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("transitInfo", collectionSchema);
