const { Schema, model, Types } = require("mongoose");
const { ObjectId } = Types;

const collectionSchema = new Schema(
  {
    userId: {
      type: ObjectId,
    },
    movementId: {
      type: ObjectId,
    },
    paymentId: {
      type: String,
    },
    status: {
      type: String,
    },
    payment_source: {
      paypal: {
        email_address: {
          type: String,
        },
        account_id: {
          type: String,
        },
        account_status: {
          type: String,
        },
        name: {
          given_name: {
            type: String,
          },
          surname: {
            type: String,
          },
        },
        business_name: {
          type: String,
        },
        address: {
          country_code: {
            type: String,
          },
        },
      },
    },
  },
  { timestamps: true }
);

module.exports = model("payment", collectionSchema);
