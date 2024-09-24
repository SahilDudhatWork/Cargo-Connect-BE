const Banners = require("../../../model/admin/banners");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const upload = require("../../../middleware/multer");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const uploadMiddleware = upload.any();

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

    const { role } = body;
    const banners = [];

    files.forEach((file) => {
      const fieldIndex = file.fieldname.match(/\d+/)[0];
      const linkKey = `banners[${fieldIndex}].link`;
      banners.push({
        image: file.location,
        link: body[linkKey] || "",
      });
    });

    const data = { role, banners };

    let banner = await Banners.findOne({ role });

    let saveData;
    if (banner) {
      saveData = await Banners.findByIdAndUpdate(banner._id, data, {
        new: true,
      });
    } else {
      saveData = await Banners.create(data);
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
