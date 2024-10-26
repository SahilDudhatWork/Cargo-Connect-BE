const { Schema, model, Types } = require("mongoose");
const { ObjectId } = Types;

const collectionSchema = new Schema(
  {
    clientRelationId: {
      type: ObjectId,
    },
    movementId: {
      type: ObjectId,
    },
    collection: {
      type: String,
    },
    title: {
      type: String,
    },
    body: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = model("notification", collectionSchema);
