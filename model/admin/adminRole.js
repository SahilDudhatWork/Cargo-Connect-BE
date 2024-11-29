const { Schema, model, Types } = require("mongoose");
const { ObjectId } = Types;

const collectionSchema = new Schema(
  {
    roleTitle: {
      type: String,
      default: null,
    },
    access: [
      {
        menuId: {
          type: ObjectId,
          required: true,
        },
        add: {
          type: Boolean,
          default: false,
        },
        read: {
          type: Boolean,
          default: false,
        },
        edit: {
          type: Boolean,
          default: false,
        },
        delete: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("adminRole", collectionSchema);
