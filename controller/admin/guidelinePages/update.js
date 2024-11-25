const GuidelinePages = require("../../../model/common/guidelinePages");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const convertToSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const update = async (req, res) => {
  const { logger, params, body } = req;
  try {
    const { id } = params;
    body.slug = convertToSlug(body.title);

    const existingRecord = await GuidelinePages.findOne({ slug: body.slug });
    if (existingRecord) {
      return Response.error({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: `Title ${ERROR_MSGS.DATA_EXISTS}`,
      });
    }

    const updatedData = await GuidelinePages.findByIdAndUpdate(id, body, {
      new: true,
    });

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.UPDATED_SUCCESSFULLY,
      data: updatedData,
    });
  } catch (error) {
    console.error("Error :", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  update,
};
