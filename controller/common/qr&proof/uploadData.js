const Movement = require("../../../model/movement/movement");
const Response = require("../../../helper/response");
const upload = require("../../../middleware/multer");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { handleException } = require("../../../helper/exception");

// Middleware for handling file uploads
const uploadMiddleware = upload.fields([
  { name: "qrCode", maxCount: 1 },
  { name: "proofOfPhotography", maxCount: 10 },
]);

const uploadQr = async (req, res) => {
  const { logger, params, files } = req;
  try {
    let proofOfPhotography;
    if (files["proofOfPhotography"]) {
      proofOfPhotography = files["proofOfPhotography"].map((i) => i.location);
    }

    const payload = {
      qrCode: files["qrCode"] ? files["qrCode"][0].location : null,
      proofOfPhotography,
    };

    await Movement.findByIdAndUpdate({ _id: params.movementId }, payload, {
      new: true,
    });
    return Response.success({
      res,
      status: STATUS_CODE.CREATED,
      msg: INFO_MSGS.UPLOADED_SUCCESSFULLY,
      data: payload,
    });
  } catch (error) {
    console.error("Error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  uploadQr,
  uploadMiddleware,
};
