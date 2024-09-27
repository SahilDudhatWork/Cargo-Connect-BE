const { Schema, model, ObjectId } = require("mongoose");
const { generateNumOrCharId } = require("../../utils/generateUniqueId");

const collectionSchema = new Schema(
  {
    _id: {
      type: String,
      default: generateNumOrCharId,
      unique: true,
    },
    clientRelationId: {
      type: ObjectId,
    },
    type: {
      type: String,
      default: null,
      enum: ["User", "Carrier"],
    },
    companyName: {
      type: String,
      default: null,
    },
    contactName: {
      type: String,
      default: null,
    },
    emailAddress: {
      type: String,
      default: null,
    },
    countryCode: {
      type: Number,
      default: 1,
    },
    contactNo: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = model("reference", collectionSchema);
