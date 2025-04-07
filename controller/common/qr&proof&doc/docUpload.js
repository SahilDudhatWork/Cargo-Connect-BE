const Movement = require("../../../model/movement/movement");
const Admin = require("../../../model/admin/admin");
const Notification = require("../../../model/common/notification");
const { sendNotification } = require("../../../utils/nodemailer");
const {
  sendNotificationInApp,
} = require("../../../utils/sendNotificationInApp");
const {
  sendNotificationInWeb,
} = require("../../../utils/sendNotificationInWeb");
const Response = require("../../../helper/response");
const upload = require("../../../middleware/multer");
const { handleException } = require("../../../helper/exception");
const {
  getTypeOfService_TypeOfTransportation_Pipeline,
  fetchVehicles_Pipeline,
  addresses_Pipeline,
  operators_Pipeline,
  port_BridgeOfCrossing_Pipeline,
  specialrequirements_Pipeline,
  users_Pipeline,
  carrier_Pipeline,
  ratting_Pipeline,
} = require("../../../utils/lookups");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const requiredConditions = {
  cartaPorte: {
    typeOfService: ["Northbound Service", "Southbound"],
    userComForType: "",
    carrierComForType: "",
    speReq: "",
    modeOfTrans: "",
  },
  cartaPorteFolio: {
    typeOfService: ["Northbound Service", "Southbound"],
    userComForType: "",
    carrierComForType: "MEXICO",
    speReq: "",
    modeOfTrans: "",
  },
  doda: {
    typeOfService: ["Northbound Service", "Southbound"],
    userComForType: "",
    carrierComForType: "",
    speReq: "",
    modeOfTrans: "",
  },
  entryPrefileInbond: {
    typeOfService: ["Northbound Service"],
    userComForType: "",
    carrierComForType: "",
    speReq: "",
    modeOfTrans: "",
  },
  aceEManifest: {
    typeOfService: ["Northbound Service", "Southbound"],
    userComForType: "",
    carrierComForType: "",
    speReq: "",
    modeOfTrans: "",
  },
  itnInbondNoItnNeeded: {
    typeOfService: ["Southbound"],
    userComForType: "",
    carrierComForType: "",
    speReq: "",
    modeOfTrans: "",
  },
  letterWithInstructionsMemo: {
    typeOfService: ["Northbound Service", "Southbound"],
    userComForType: "",
    carrierComForType: "",
    speReq: "",
    modeOfTrans: "",
  },
  oversizeNotificationUser: {
    typeOfService: ["Northbound Service", "Southbound"],
    userComForType: "",
    carrierComForType: "",
    speReq: "Over Size",
    modeOfTrans: "",
  },
  oversizePermitCarrier: {
    typeOfService: "",
    userComForType: "",
    carrierComForType: "",
    speReq: "Over Size",
    modeOfTrans: "",
  },
  overweightPermit: {
    typeOfService: ["Northbound Service", "Southbound"],
    userComForType: "",
    carrierComForType: "",
    speReq: "Over Weight",
    modeOfTrans: "",
  },
  temperatureControlIn: {
    typeOfService: ["Northbound Service", "Southbound"],
    userComForType: "",
    carrierComForType: "",
    speReq: "",
    modeOfTrans: "",
  },
  temperatureControlOut: {
    typeOfService: ["Northbound Service", "Southbound"],
    userComForType: "",
    carrierComForType: "",
    speReq: "",
    modeOfTrans: "Reefer",
  },
  hazmatBol: {
    typeOfService: ["Northbound Service", "Southbound"],
    userComForType: "",
    carrierComForType: "",
    speReq: "Hazmat (USD405)",
    modeOfTrans: "",
  },
  hazmatSdsSafetyDataSheet: {
    typeOfService: ["Northbound Service", "Southbound"],
    userComForType: "",
    carrierComForType: "",
    speReq: "Hazmat (USD405)",
    modeOfTrans: "",
  },
  sagarpaPackageAgriculture: {
    typeOfService: ["Northbound Service", "Southbound"],
    userComForType: "",
    carrierComForType: "",
    speReq: "Sagarpa Inspection MX (USD 45)",
    modeOfTrans: "",
  },
  profepaPackageEnvironmental: {
    typeOfService: ["Northbound Service", "Southbound"],
    userComForType: "",
    carrierComForType: "",
    speReq: "Profepa Inspection MX (USD 45)",
    modeOfTrans: "",
  },
  intercambioTrailerRelease: {
    typeOfService: ["Northbound Service", "Southbound"],
    userComForType: "",
    carrierComForType: "",
    speReq: "",
    modeOfTrans: "FTL",
  },
  sedenaPackage: {
    typeOfService: ["Southbound"],
    userComForType: "",
    carrierComForType: "",
    speReq: "Sedena Inspection MX (USD 0)",
    modeOfTrans: "",
  },
  proofOfDelivery: {
    typeOfService: ["Northbound Service", "Southbound"],
    userComForType: "",
    carrierComForType: "",
    speReq: "",
    modeOfTrans: "",
  },
  damagesDiscrepancies: {
    typeOfService: ["Northbound Service", "Southbound"],
    userComForType: "",
    carrierComForType: "",
    speReq: "",
    modeOfTrans: "",
  },
};
const rolePermissions = {
  User: [
    "cartaPorte",
    "doda",
    "entryPrefileInbond",
    "itnInbondNoItnNeeded",
    "letterWithInstructionsMemo",
    "oversizeNotificationUser",
    "overweightPermit",
    "hazmatBol",
    "hazmatSdsSafetyDataSheet",
    "sagarpaPackageAgriculture",
    "profepaPackageEnvironmental",
    "intercambioTrailerRelease",
    "sedenaPackage",
    "damagesDiscrepancies",
  ],
  Carrier: [
    "cartaPorteFolio",
    "aceEManifest",
    "oversizePermitCarrier",
    "overweightPermit",
    "temperatureControlIn",
    "temperatureControlOut",
    "proofOfDelivery",
    "damagesDiscrepancies",
  ],
  Operator: [
    "temperatureControlIn",
    "temperatureControlOut",
    "profepaPackageEnvironmental",
    "proofOfDelivery",
    "damagesDiscrepancies",
  ],
};
const servicePermissions = {
  NorthboundService: [
    "cartaPorte",
    "cartaPorteFolio",
    "doda",
    "entryPrefileInbond",
    "aceEManifest",
    "letterWithInstructionsMemo",
    "oversizeNotificationUser",
    "overweightPermit",
    "temperatureControlOut",
    "hazmatBol",
    "hazmatSdsSafetyDataSheet",
    "sagarpaPackageAgriculture",
    "profepaPackageEnvironmental",
    "intercambioTrailerRelease",
    "proofOfDelivery",
    "damagesDiscrepancies",
    "oversizePermitCarrier",
  ],
  Southbound: [
    "cartaPorte",
    "cartaPorteFolio",
    "doda",
    "aceEManifest",
    "itnInbondNoItnNeeded",
    "letterWithInstructionsMemo",
    "oversizeNotificationUser",
    "overweightPermit",
    "temperatureControlOut",
    "hazmatBol",
    "hazmatSdsSafetyDataSheet",
    "sagarpaPackageAgriculture",
    "profepaPackageEnvironmental",
    "intercambioTrailerRelease",
    "sedenaPackage",
    "proofOfDelivery",
    "damagesDiscrepancies",
    "oversizePermitCarrier",
  ],
  Other: ["oversizePermitCarrier"],
};

const validateRoleFields = (role, docObj, obj) => {
  const reqFields = rolePermissions[role];
  const reqSer = servicePermissions[obj.typeOfService.replace(" ", "")];
  const matchingKeys = reqFields.filter((key) => reqSer.includes(key));
  const resultObj = {};

  const filteredKeys = matchingKeys.filter(
    (key) => Array.isArray(docObj[key]) && docObj[key].length > 0
  );

  const filteredDocObj = Object.fromEntries(
    Object.entries(docObj).filter(
      ([key, value]) => Array.isArray(value) && value.length > 0
    )
  );

  filteredKeys.map((key) => {
    const filDoc = filteredDocObj[key];
    const filReqCond = requiredConditions[key];
    const cleanedFilReqCond = Object.fromEntries(
      Object.entries(filReqCond).filter(([_, value]) => {
        return Array.isArray(value) ? value.length > 0 : value !== "";
      })
    );

    console.log(
      "------------------------------ ",
      key,
      "------------------------------:>> "
    );
    const finalObj = {};
    Object.keys(cleanedFilReqCond).every((k) => {
      let includesCheck = false;

      if (filDoc.length >= 1) {
        if (Array.isArray(cleanedFilReqCond[k])) {
          if (Array.isArray(obj[k])) {
            includesCheck = obj[k].some((val) =>
              cleanedFilReqCond[k].includes(val)
            );
          } else {
            includesCheck = cleanedFilReqCond[k].includes(obj[k]);
          }
        } else {
          if (Array.isArray(obj[k])) {
            includesCheck = obj[k].includes(cleanedFilReqCond[k]);
          } else {
            includesCheck = cleanedFilReqCond[k] === obj[k];
          }
        }
      } else {
        includesCheck = false;
      }
      console.log(
        "Req:>> ",
        cleanedFilReqCond[k],
        "====",
        obj[k],
        "==> : ",
        includesCheck
      );
      finalObj[k] = includesCheck;
      return true;
    });
    const result = Object.values(finalObj).every((val) => val);

    console.log("finalObj:", finalObj);
    console.log("Final Result:", result);
    resultObj[key] = result;
  });
  console.log("resultObj :>> ", resultObj);
  const Finalresult = Object.values(resultObj).every((val) => val);
  console.log("Finalresult :>> ", Finalresult);
};

const uploadDocsMiddleware = upload.fields(
  Object.keys(requiredConditions).map((field) => ({
    name: field,
    maxCount: 10,
  }))
);

const extractFileLocations = (files) => {
  const documents = {};
  Object.keys(files).forEach((key) => {
    documents[key] = files[key].map((file) => {
      return file.location;
    });
  });
  return documents;
};

const docUpload = async (req, res) => {
  const { logger, params, files, role } = req;
  try {
    const fetchData = await fetchMovement(params.movementId);

    if (!fetchData) {
      return Response.error({
        res,
        status: STATUS_CODE.NOT_FOUND,
        msg: ERROR_MSGS.DATA_NOT_AVAILABLE,
      });
    }

    const documents = extractFileLocations(files);

    const docObj = {
      cartaPorte:
        documents?.cartaPorte ?? fetchData?.documents["cartaPorte"] ?? [],
      cartaPorteFolio:
        documents?.cartaPorteFolio ??
        fetchData?.documents["cartaPorteFolio"] ??
        [],
      doda: documents?.doda ?? fetchData?.documents["doda"] ?? [],
      entryPrefileInbond:
        documents?.entryPrefileInbond ??
        fetchData?.documents["entryPrefileInbond"] ??
        [],
      aceEManifest:
        documents?.aceEManifest ?? fetchData?.documents["aceEManifest"] ?? [],
      itnInbondNoItnNeeded:
        documents?.itnInbondNoItnNeeded ??
        fetchData?.documents["itnInbondNoItnNeeded"] ??
        [],
      letterWithInstructionsMemo:
        documents?.letterWithInstructionsMemo ??
        fetchData?.documents["letterWithInstructionsMemo"] ??
        [],
      oversizeNotificationUser:
        documents?.oversizeNotificationUser ??
        fetchData?.documents["oversizeNotificationUser"] ??
        [],
      oversizePermitCarrier:
        documents?.oversizePermitCarrier ??
        fetchData?.documents["oversizePermitCarrier"] ??
        [],
      overweightPermit:
        documents?.overweightPermit ??
        fetchData?.documents["overweightPermit"] ??
        [],
      temperatureControlIn:
        documents?.temperatureControlIn ??
        fetchData?.documents["temperatureControlIn"] ??
        [],
      temperatureControlOut:
        documents?.temperatureControlOut ??
        fetchData?.documents["temperatureControlOut"] ??
        [],
      hazmatBol:
        documents?.hazmatBol ?? fetchData?.documents["hazmatBol"] ?? [],
      hazmatSdsSafetyDataSheet:
        documents?.hazmatSdsSafetyDataSheet ??
        fetchData?.documents["hazmatSdsSafetyDataSheet"] ??
        [],
      sagarpaPackageAgriculture:
        documents?.sagarpaPackageAgriculture ??
        fetchData?.documents["sagarpaPackageAgriculture"] ??
        [],
      profepaPackageEnvironmental:
        documents?.profepaPackageEnvironmental ??
        fetchData?.documents["profepaPackageEnvironmental"] ??
        [],
      intercambioTrailerRelease:
        documents?.intercambioTrailerRelease ??
        fetchData?.documents["intercambioTrailerRelease"] ??
        [],
      sedenaPackage:
        documents?.sedenaPackage ?? fetchData?.documents["sedenaPackage"] ?? [],
      proofOfDelivery:
        documents?.proofOfDelivery ??
        fetchData?.documents["proofOfDelivery"] ??
        [],
      damagesDiscrepancies:
        documents?.damagesDiscrepancies ??
        fetchData?.documents["damagesDiscrepancies"] ??
        [],
    };

    await Movement.findOneAndUpdate(
      { movementId: params.movementId },
      { documents: docObj },
      { new: true }
    );

    // const obj = {
    //   typeOfService: fetchData?.typeOfService?.title,
    //   userComForType: fetchData?.userData?.companyFormationType,
    //   carrierComForType: fetchData?.carrierData?.companyFormationType,
    //   speReq: fetchData?.specialRequirements.map((req) => req.type),
    //   modeOfTrans: [
    //     fetchData?.modeOfTransportation?.title,
    //     fetchData?.typeOfTransportation?.title,
    //   ],
    // };

    if (fetchData.reqDocFields[role]) {
      Object.keys(fetchData.reqDocFields[role]).forEach((key) => {
        if (docObj.hasOwnProperty(key)) {
          fetchData.reqDocFields[role][key] = docObj[key].length > 0;
        }
      });

      await Movement.findOneAndUpdate(
        { movementId: params.movementId },
        { $set: { [`reqDocFields.${role}`]: fetchData.reqDocFields[role] } },
        { new: true }
      );
    }
    const isAllUserTrue = Object.values(
      fetchData.reqDocFields.User || {}
    ).every(Boolean);
    const isAllCarrierTrue = Object.values(
      fetchData.reqDocFields.Carrier || {}
    ).every(Boolean);

    const finalResult = isAllUserTrue && isAllCarrierTrue;

    // const validationErrors = await validateRoleFields(role, docObj, obj);

    if (finalResult) {
      await Movement.findOneAndUpdate(
        { movementId: params.movementId },
        { status: "InProgress" },
        { new: true }
      );
      await sendUserInTransitNotification(
        fetchData.userData,
        fetchData._id,
        fetchData?.movementId
      );
      const admins = await Admin.find();
      await sendAdminLoadInTransitNotification(
        admins,
        fetchData._id,
        fetchData.movementId,
      );
    }

    return Response.success({
      res,
      status: STATUS_CODE.CREATED,
      msg: INFO_MSGS.UPLOADED_SUCCESSFULLY,
      data: docObj,
    });
  } catch (error) {
    console.log("error :>> ", error);
    return handleException(logger, res, error);
  }
};

const fetchMovement = async (id) => {
  let [getData] = await Movement.aggregate([
    {
      $match: {
        movementId: id,
      },
    },
    ...getTypeOfService_TypeOfTransportation_Pipeline(),
    ...fetchVehicles_Pipeline(),
    ...addresses_Pipeline(),
    ...operators_Pipeline(),
    ...port_BridgeOfCrossing_Pipeline(),
    ...specialrequirements_Pipeline(),
    ...users_Pipeline(),
    ...carrier_Pipeline(),
    ...ratting_Pipeline(),
    {
      $project: {
        __v: 0,
      },
    },
  ]);
  return getData;
};

module.exports = {
  docUpload,
  uploadDocsMiddleware,
};

// In Transit Notification
const sendUserInTransitNotification = async (userData, movementId, movementAccId) => {
  const body = "Cargo Connect";
  const title = `Hi ${userData?.contactName}, Your service is on the way. Track it in real-time here: https://mycargoconnects.com/my-orders/service/${movementAccId}.`;

  const notificationTasks = [];

  if (userData?.deviceToken) {
    notificationTasks.push(
      sendNotificationInApp(userData?.deviceToken, title, body)
    );
  }
  if (userData?.webToken) {
    notificationTasks.push(
      sendNotificationInWeb(userData?.webToken, title, body)
    );
  }
  if (userData?.deviceToken || userData?.webToken) {
    notificationTasks.push(
      Notification.create({
        movementId,
        clientRelationId: userData._id,
        collection: "Users",
        title,
        body,
      })
    );
  }

  notificationTasks.push(
    sendNotification(userData?.email, title, userData?.contactName, "In Transit")
  );

  await Promise.all(notificationTasks);
};

// Load in Transit Notification
const sendAdminLoadInTransitNotification = async (
  admins,
  movementId,
  movementAccId,
) => {
  await Promise.all(
    admins.map(async (admin) => {
      const body = "Cargo Connect";
      const title = `Hi ${admin?.contactName}, (${movementAccId}) Services are now in transit. Follow the progress here: https://mycargoconnects.com/my-orders/service/${movementAccId}.`;

      const notificationTasks = [];

      if (admin?.deviceToken) {
        notificationTasks.push(
          sendNotificationInApp(admin?.deviceToken, title, body)
        );
      }
      if (admin?.webToken) {
        notificationTasks.push(
          sendNotificationInWeb(admin?.webToken, title, body)
        );
      }
      if (admin?.deviceToken || admin?.webToken) {
        notificationTasks.push(
          Notification.create({
            movementId,
            clientRelationId: admin._id,
            collection: "Admins",
            title,
            body,
          })
        );
      }
      notificationTasks.push(
        sendNotification(
          admin?.email,
          title,
          admin?.contactName,
          "Load in Transit"
        )
      );

      await Promise.all(notificationTasks);
    })
  );
};
