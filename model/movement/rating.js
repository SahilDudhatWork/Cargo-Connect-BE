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
  },
  {
    timestamps: true,
  }
);

module.exports = model("rating", collectionSchema);
