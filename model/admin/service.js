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
  },
  {
    timestamps: true,
  }
);

module.exports = model("service", collectionSchema);
