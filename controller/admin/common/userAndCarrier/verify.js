const Response = require("../../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../../helper/constant");
const { handleException } = require("../../../../helper/exception");
const { hendleModel } = require("../../../../utils/hendleModel");

const verify = async (req, res) => {
  const { logger } = req;
  try {
    const { type, id } = req.params;

    const Model = await hendleModel(res, type);

    const fetchData = await Model.findById(id);

    if (!fetchData) {
      return Response.error({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.DATA_NOT_AVAILABLE,
      });
    }
    
    fetchData.verifyByAdmin = true;
    fetchData.save();

    const typeUpperCase = type.replace(/\b\w/g, (char) => char.toUpperCase());

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: `${typeUpperCase} ${INFO_MSGS.VERIFY_SUCCESSFULLY}`,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  verify,
};