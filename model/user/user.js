const { Schema, model, Types } = require("mongoose");
const { ObjectId } = Types;

const collectionSchema = new Schema(
  {
    accountId: {
      type: Number,
      lowercase: true,
      default: null,
      unique: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    companyName: {
      type: String,
      lowercase: true,
      default: null,
    },
    countryCode: {
      type: Number,
    },
    contactName: {
      type: String,
      lowercase: true,
      default: null,
    },
    contactNumber: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      lowercase: true,
      default: null,
      unique: true,
    },
    password: {
      type: String,
      default: null,
      unique: true,
    },
    companyFormationType: {
      type: String,
      default: null,
    },
    companyFormation: {
      usa: {
        w9_Form: {
          type: String,
        },
        utility_Bill: {
          type: String,
        },
      },
      maxico: {
        copia_Rfc_Form: {
          type: String,
        },
        constance_Of_Fiscal_Situation: {
          type: String,
        },
        proof_of_Favorable: {
          type: String,
        },
        proof_Of_Address: {
          type: String,
        },
      },
    },
    commercialReference: [
      {
        accountId: {
          type: String,
          default: null,
          unique: true,
        },
        companyName: {
          type: String,
        },
        contactName: {
          type: String,
        },
        emailAddress: {
          type: String,
        },
        countryCode: {
          type: Number,
        },
        contactNo: {
          type: Number,
        },
      },
    ],
    verifyByAdmin: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    stepCompleted: {
      type: Boolean,
      default: false,
    },
    token: {
      type: {
        type: String,
        enum: ["Access", "Denied"],
      },
      token: {
        type: String,
      },
      createdAt: {
        type: Date,
      },
    },
    forgotPassword: {
      createdAt: {
        type: Date,
        default: null,
      },
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

module.exports = model("user", collectionSchema);
