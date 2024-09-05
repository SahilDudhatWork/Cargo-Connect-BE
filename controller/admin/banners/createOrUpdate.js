const Banners = require("../../../model/admin/banners");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const upload = require("../../../middleware/multer");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const uploadMiddleware = upload.fields([
  { name: "user_mainBanner", maxCount: 1 },
  { name: "user_serviceBanner", maxCount: 1 },
  { name: "user_operationsBanner", maxCount: 1 },
]);

const createOrUpdate = async (req, res) => {
  const { logger, body, files, fileValidationError } = req;
  try {
    if (fileValidationError) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: fileValidationError,
      });
    }

    body.user = {
      mainBanner: files["user_mainBanner"]
        ? files["user_mainBanner"][0].presignedUrl
        : null,
      serviceBanner: files["user_serviceBanner"]
        ? files["user_serviceBanner"][0].presignedUrl
        : null,
      operationsBanner: files["user_operationsBanner"]
        ? files["user_operationsBanner"][0].presignedUrl
        : null,
    };

    let banner = await Banners.findOne();

    let saveData;
    if (banner) {
      saveData = await Banners.findByIdAndUpdate(banner._id, body, {
        new: true,
      });
    } else {
      saveData = await Banners.create(body);
    }

    const statusCode = saveData ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = saveData
      ? banner
        ? INFO_MSGS.UPDATED_SUCCESSFULLY
        : INFO_MSGS.CREATED_SUCCESSFULLY
      : ERROR_MSGS.CREATE_ERR;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: saveData || null,
    });
  } catch (error) {
    return handleException(logger, res, error);
  }
};

module.exports = {
  uploadMiddleware,
  createOrUpdate,
};
