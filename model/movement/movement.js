const { Schema, model, Types } = require("mongoose");
const { ObjectId } = Types;

const collectionSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    carrierId: {
      type: ObjectId,
      default: null,
    },
    movementId: {
      type: String,
      default: null,
      unique: true,
    },
    operatorId: {
      type: ObjectId,
    },
    vehicleId: {
      type: ObjectId,
    },
    amountDetails: {
      price: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
      },
      paymentMode: {
        type: String,
      },
    },
    typeOfService: {
      type: ObjectId,
      default: null,
    },
    typeOfTransportation: {
      type: ObjectId,
      default: null,
    },
    modeOfTransportation: {
      type: ObjectId,
      default: null,
    },
    port_BridgeOfCrossing: {
      type: ObjectId,
    },
    userReference: {
      type: String,
      default: null,
    },
    carrierReference: {
      type: String,
      default: null,
    },
    specialRequirements: [
      {
        type: ObjectId,
        default: null,
      },
    ],
    quantityForChains: {
      type: Number,
      default: null,
    },
    quantityForStraps: {
      type: Number,
      default: null,
    },
    quantityForTarps: {
      type: Number,
      default: 0,
    },
    programming: {
      type: String,
      default: null,
    },
    schedule: {
      date: {
        type: String,
        default: null,
      },
      time: {
        type: String,
        default: null,
      },
    },
    qrCode: {
      type: Array,
      default: [],
    },
    proofOfPhotography: {
      type: Array,
      default: [],
    },
    documents: {
      type: Map,
      of: [String],
      default: {},
      enum: {
        cartaPorte: [],
        cartaPorteFolio: [],
        doda: [],
        entryPrefileInbond: [],
        aceEManifest: [],
        itnInbondNoItnNeeded: [],
        letterWithInstructionsMemo: [],
        oversizeNotificationUser: [],
        oversizePermitCarrier: [],
        overweightNotification: [],
        overweightPermit: [],
        temperatureControlIn: [],
        temperatureControlOut: [],
        hazmatBol: [],
        hazmatSdsSafetyDataSheet: [],
        sagarpaPackageAgriculture: [],
        profepaPackageEnvironmental: [],
        intercambioTrailerRelease: [],
        sedenaPackage: [],
        proofOfDeliveryForUser: [],
        proofOfDeliveryForCarrier: [],
        proofOfDeliveryForOperator: [],
        damagesDiscrepanciesForUser: [],
        damagesDiscrepanciesForCarrier: [],
        damagesDiscrepanciesForOperator: [],
        cuadernoAta: [],
        informalExport: [],
      },
    },
    pickUpAddressIds: [{ type: ObjectId }],
    dropAddressIds: [{ type: ObjectId }],
    status: {
      type: String,
      default: "NewAssignments",
      enum: [
        "Completed",
        "InProgress",
        "Pending",
        "Cancelled",
        "NewAssignments",
      ],
    },
    isScheduleTriggered: {
      type: Boolean,
      default: false,
    },
    isAssign: {
      type: Boolean,
      default: false,
    },
    trailer: {
      type: String,
      default: null,
    },
    reqDocFields: {
      User: {
        type: Map,
        of: Boolean,
        default: {},
      },
      Carrier: {
        type: Map,
        of: Boolean,
        default: {},
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("movement", collectionSchema);
