const Movement = require("../../../model/movement/movement");
const Response = require("../../../helper/response");
const upload = require("../../../middleware/multer");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { handleException } = require("../../../helper/exception");

const uploadMiddleware = upload.fields([
  { name: "qrCode", maxCount: 1 },
  { name: "proofOfPhotography", maxCount: 10 },
  { name: "documents", maxCount: 10 },
]);

const extractFileLocations = (files, fieldName) => {
  return files[fieldName] ? files[fieldName].map((file) => file.location) : [];
};

const uploadData = async (req, res) => {
  const { logger, params, files } = req;
  try {
    const proofOfPhotography = extractFileLocations(
      files,
      "proofOfPhotography"
    );
    const documents = extractFileLocations(files, "documents");
    const qrCode = files["qrCode"] ? files["qrCode"][0].location : null;

    const payload = { qrCode, proofOfPhotography, documents };

    const updateData = await Movement.findOneAndUpdate(
      { movementId: params.movementId },
      payload,
      { new: true }
    );

    if (updateData.qrCode && updateData.documents) {
      await Movement.findOneAndUpdate(
        { movementId: params.movementId },
        { status: "InProgress" },
        { new: true }
      );
    }

    return Response.success({
      res,
      status: STATUS_CODE.CREATED,
      msg: INFO_MSGS.UPLOADED_SUCCESSFULLY,
      data: payload,
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
