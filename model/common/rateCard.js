const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const pricePairSchema = new Schema(
  {
    _id: {
      type: Types.ObjectId,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const rateCardSchema = new Schema(
  {
    cardName: { type: String, default: null },
    carrierId: { type: String, default: null },
    carrierAssign: { type: Boolean, default: false },

    typeOfService: { type: [pricePairSchema], default: [] },
    typeOfTransportation: { type: [pricePairSchema], default: [] },
    modeOfTransportation: { type: [pricePairSchema], default: [] },
    port_BridgeOfCrossing: { type: [pricePairSchema], default: [] },
    specialRequirements: { type: [pricePairSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("rateCard", rateCardSchema);
