const { Schema, model, Types } = require("mongoose");
const { ObjectId } = Types;

const collectionSchema = new Schema(
  {
    movementId: {
      type: ObjectId,
      default: null,
    },
    rating: {
      type: Number,
      default: 0,
    },
    experience: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      default: null,
      enum: ["User", "Carrier"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("rating", collectionSchema);
