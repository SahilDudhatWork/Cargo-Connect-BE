const Movement = require("../../../model/movement/movement");
const TransitInfo = require("../../../model/admin/transitInfo");
const Response = require("../../../helper/response");
const upload = require("../../../middleware/multer");
const { handleException } = require("../../../helper/exception");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

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

const fieldTypeRestrictions = {
  cartaPorte: ["Northbound Service", "Southbound"],
  cartaPorteFolio: ["Northbound Service", "Southbound"],
  doda: ["Northbound Service", "Southbound"],
  entryPrefileInbond: ["Northbound Service"],
  aceEManifest: ["Northbound Service", "Southbound"],
  itnInbondNoItnNeeded: ["Southbound"],
  letterWithInstructionsMemo: ["Northbound Service", "Southbound"],
  oversizeNotificationUser: ["Northbound Service", "Southbound"],
  oversizePermitCarrier: ["Other"],
  overweightPermit: ["Northbound Service", "Southbound"],
  temperatureControlIn: ["Northbound Service", "Southbound"],
  temperatureControlOut: ["Northbound Service", "Southbound"],
  hazmatBol: ["Northbound Service", "Southbound"],
  hazmatSdsSafetyDataSheet: ["Northbound Service", "Southbound"],
  sagarpaPackageAgriculture: ["Northbound Service", "Southbound"],
  profepaPackageEnvironmental: ["Northbound Service", "Southbound"],
  intercambioTrailerRelease: ["Northbound Service", "Southbound"],
  sedenaPackage: ["Southbound"],
  proofOfDelivery: ["Northbound Service", "Southbound"],
  damagesDiscrepancies: ["Northbound Service", "Southbound"],
};

const validateRoleFields = (role, files, typeOfServiceTitle) => {
  const allowedFields = rolePermissions[role] || [];
  const invalidKeys = [];

  Object.keys(files).forEach((key) => {
    if (!allowedFields.includes(key)) {
      invalidKeys.push(key);
    } else {
      const allowedTypes = fieldTypeRestrictions[key];
      if (allowedTypes) {
        if (
          (allowedTypes.includes("Other") &&
            ["Northbound Service", "Southbound"].includes(
              typeOfServiceTitle
            )) ||
          (!allowedTypes.includes(typeOfServiceTitle) &&
            !allowedTypes.includes("Other"))
        ) {
          invalidKeys.push(key);
        }
      }
    }
  });

  return invalidKeys;
};

const uploadDocsMiddleware = upload.fields(
  Object.keys(fieldTypeRestrictions).map((field) => ({
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
    const fetchData = await Movement.findOne({ movementId: params.movementId });

    if (!fetchData) {
      return Response.error({
        res,
        status: STATUS_CODE.NOT_FOUND,
        msg: ERROR_MSGS.DATA_NOT_AVAILABLE,
      });
    }

    // const transitInfo = await TransitInfo.findOne({
    //   "typeOfService._id": fetchData.typeOfService,
    // });

    // if (!transitInfo) {
    //   return Response.error({
    //     res,
    //     status: STATUS_CODE.NOT_FOUND,
    //     msg: "Transit info not found",
    //   });
    // }

    // const [typeOfService] = transitInfo.typeOfService.filter(
    //   (item) => item._id.toString() === fetchData.typeOfService.toString()
    // );

    // if (!typeOfService) {
    //   return Response.error({
    //     res,
    //     status: STATUS_CODE.NOT_FOUND,
    //     msg: "Matching typeOfService not found",
    //   });
    // }

    // const validationErrors = await validateRoleFields(
    //   role,
    //   files,
    //   typeOfService.title
    // );

    // if (validationErrors.length > 0) {
    //   return Response.error({
    //     res,
    //     status: STATUS_CODE.BAD_REQUEST,
    //     msg: `The following field(s) are not valid for ${role} with typeOfService '${
    //       typeOfService.title
    //     }': ${validationErrors.join(", ")}`,
    //   });
    // }

    const documents = extractFileLocations(files);

    const docObj = {
      cartaPorte:
        documents?.cartaPorte ??
        fetchData?.documents.get("cartaPorteFolio") ??
        [],
      cartaPorteFolio:
        documents?.cartaPorteFolio ??
        fetchData?.documents.get("cartaPorteFolio") ??
        [],
      doda: documents?.doda ?? fetchData?.documents.get("doda") ?? [],
      entryPrefileInbond:
        documents?.entryPrefileInbond ??
        fetchData?.documents.get("entryPrefileInbond") ??
        [],
      aceEManifest:
        documents?.aceEManifest ?? fetchData?.documents.get("aceEManifest") ?? [],
      itnInbondNoItnNeeded:
        documents?.itnInbondNoItnNeeded ??
        fetchData?.documents.get("itnInbondNoItnNeeded") ??
        [],
      letterWithInstructionsMemo:
        documents?.letterWithInstructionsMemo ??
        fetchData?.documents.get("letterWithInstructionsMemo") ??
        [],
      oversizeNotificationUser:
        documents?.oversizeNotificationUser ??
        fetchData?.documents.get("oversizeNotificationUser") ??
        [],
      oversizePermitCarrier:
        documents?.oversizePermitCarrier ??
        fetchData?.documents.get("oversizePermitCarrier") ??
        [],
      overweightPermit:
        documents?.overweightPermit ??
        fetchData?.documents.get("overweightPermit") ??
        [],
      temperatureControlIn:
        documents?.temperatureControlIn ??
        fetchData?.documents.get("temperatureControlIn") ??
        [],
      temperatureControlOut:
        documents?.temperatureControlOut ??
        fetchData?.documents.get("temperatureControlOut") ??
        [],
      hazmatBol:
        documents?.hazmatBol ?? fetchData?.documents.get("hazmatBol") ?? [],
      hazmatSdsSafetyDataSheet:
        documents?.hazmatSdsSafetyDataSheet ??
        fetchData?.documents.get("hazmatSdsSafetyDataSheet") ??
        [],
      sagarpaPackageAgriculture:
        documents?.sagarpaPackageAgriculture ??
        fetchData?.documents.get("sagarpaPackageAgriculture") ??
        [],
      profepaPackageEnvironmental:
        documents?.profepaPackageEnvironmental ??
        fetchData?.documents.get("profepaPackageEnvironmental") ??
        [],
      intercambioTrailerRelease:
        documents?.intercambioTrailerRelease ??
        fetchData?.documents.get("intercambioTrailerRelease") ??
        [],
      sedenaPackage:
        documents?.sedenaPackage ??
        fetchData?.documents.get("sedenaPackage") ??
        [],
      proofOfDelivery:
        documents?.proofOfDelivery ??
        fetchData?.documents.get("proofOfDelivery") ??
        [],
      damagesDiscrepancies:
        documents?.damagesDiscrepancies ??
        fetchData?.documents.get("damagesDiscrepancies") ??
        [],
    };

    await Movement.findOneAndUpdate(
      { movementId: params.movementId },
      { documents: docObj },
      { new: true }
    );
    0;

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

module.exports = {
  docUpload,
  uploadDocsMiddleware,
};
