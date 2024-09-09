const Response = require("../../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../../helper/constant");
const { handleException } = require("../../../../helper/exception");
const { hendleModel } = require("../../../../utils/hendleModel");

const verify = async (req, res) => {
  const { logger, params } = req;
  try {
    const { type, id } = params;
    const actId = parseInt(id);
    const Model = await hendleModel(res, type);

    await Model.findOneAndUpdate(
      { accountId: actId },
      { $set: { verifyByAdmin: true } },
      { new: true }
    );

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
