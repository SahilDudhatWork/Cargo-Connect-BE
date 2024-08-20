const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const Constant = require("../../../helper/constant");

const imageUpload = async (req, res) => {
  const { logger } = req;
  try {
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    const obj = {
      res,
      msg: Constant.INFO_MSGS.CREATED_SUCCESSFULLY,
      status: Constant.STATUS_CODE.OK,
      data: {
        file: req.file,
        path: fileUrl,
      },
    };
    return Response.success(obj);
  } catch (error) {
    console.log("error", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  imageUpload,
};
