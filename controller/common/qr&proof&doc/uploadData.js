const Movement = require("../../../model/movement/movement");
const Response = require("../../../helper/response");
const upload = require("../../../middleware/multer");
const { STATUS_CODE, INFO_MSGS } = require("../../../helper/constant");
const { handleException } = require("../../../helper/exception");

const uploadMiddleware = upload.fields([
  { name: "qrCode", maxCount: 10 },
  { name: "proofOfPhotography", maxCount: 10 },
]);

const extractFileLocations = (files, fieldName) => {
  return files[fieldName] ? files[fieldName].map((file) => file.location) : [];
};

const uploadData = async (req, res) => {
  const { logger, params, files } = req;
  try {
    const qrCode = extractFileLocations(files, "qrCode");
    const proofOfPhotography = extractFileLocations(
      files,
      "proofOfPhotography"
    );

    const updatePayload = {};

    if (qrCode.length > 0) updatePayload.qrCode = qrCode;

    if (proofOfPhotography.length > 0) {
      updatePayload.proofOfPhotography = proofOfPhotography;
      updatePayload["documents.proofOfDeliveryForCarrier"] = proofOfPhotography;
    }

    await Movement.findOneAndUpdate(
      { movementId: params.movementId },
      { $set: updatePayload },
      { new: true }
    );

    // if (updateData.qrCode?.length > 0) {
    // await Movement.findOneAndUpdate(
    //   { movementId: params.movementId },
    //   { status: "InProgress" },
    //   { new: true }
    // );
    // }

    return Response.success({
      res,
      status: STATUS_CODE.CREATED,
      msg: INFO_MSGS.UPLOADED_SUCCESSFULLY,
      data: updatePayload,
    });
  } catch (error) {
    console.log("error :>> ", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  uploadData,
  uploadMiddleware,
};
