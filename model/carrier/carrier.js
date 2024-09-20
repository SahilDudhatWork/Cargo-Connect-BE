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
    contactName: {
      type: String,
      lowercase: true,
      default: null,
    },
    countryCode: {
      type: Number,
      default: 1,
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
    scac: {
      type: String,
      default: null,
    },
    caat: {
      type: String,
      default: null,
    },
    insurancePolicy: {
      type: String,
      default: null,
    },
    oea: {
      type: String,
      default: null,
    },
    ctpat: {
      type: String,
      default: null,
    },
    companyFormationType: {
      type: String,
      default: null,
    },
    companyFormation: {
      usa: {
        w9_Form: {
          type: String,
          default: null,
        },
        utility_Bill: {
          type: String,
          default: null,
        },
      },
      maxico: {
        copia_Rfc_Form: {
          type: String,
          default: null,
        },
        constance_Of_Fiscal_Situation: {
          type: String,
          default: null,
        },
        proof_of_Favorable: {
          type: String,
          default: null,
        },
        proof_Of_Address: {
          type: String,
          default: null,
        },
      },
    },
    commercialReference: [
      {
        accountId: {
          type: String,
          default: null,
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

module.exports = model("carrier", collectionSchema);
