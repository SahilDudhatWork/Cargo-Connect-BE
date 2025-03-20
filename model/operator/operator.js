const { Schema, model, Types } = require("mongoose");
const { ObjectId } = Types;

const collectionSchema = new Schema(
  {
    carrierId: {
      type: ObjectId,
      required: true,
    },
    accountId: {
      type: Number,
      default: null,
      unique: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    operatorName: {
      type: String,
      default: null,
    },
    countryCode: {
      type: Number,
      default: 1,
    },
    operatorNumber: {
      type: Number,
      default: null,
    },
    mxIdBadge: {
      type: String,
      default: null,
    },
    mxIdBadgeExpirationDate: {
      type: Date,
      default: null,
    },
    fastId: {
      type: String,
      default: null,
    },
    fastIdExpirationDate: {
      type: Date,
      default: null,
    },
    mxDriversLicense: {
      type: String,
      default: null,
    },
    mxDriversLicenseExpirationDate: {
      type: Date,
      default: null,
    },
    usDriversLicense: {
      type: String,
      default: null,
    },
    usDriversLicenseExpirationDate: {
      type: Date,
      default: null,
    },
    visaExpirationDate: {
      type: Date,
      default: null,
    },
    customsBadgeExpirationDate: {
      type: Date,
      default: null,
    },
    isAssigned: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "Active",
      enum: ["Active", "Deactive"],
    },
    lat: {
      type: String,
      default: null,
    },
    long: {
      type: String,
      default: null,
    },
    trackingLink: {
      type: String,
      default: null,
    },
    token: {
      type: {
        type: String,
        enum: ["Access", "Denied"],
      },
      accessToken: {
        type: String,
      },
      refreshToken: {
        type: String,
      },
      createdAt: {
        type: Date,
      },
    },
    deviceToken: {
      type: String,
      default: null,
    },
    webToken: {
      type: String,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("operator", collectionSchema);
