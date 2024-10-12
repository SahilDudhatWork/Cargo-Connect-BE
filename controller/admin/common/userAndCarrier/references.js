const Response = require("../../../../helper/response");
const Reference = require("../../../../model/common/reference");
const { handleException } = require("../../../../helper/exception");
const { hendleModel } = require("../../../../utils/hendleModel");
const { findOne } = require("../../../../utils/helper");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../../helper/constant");

const fetchReferences = async (req, res) => {
  const { logger, params } = req;
  try {
    const { type, id } = params;
    const actId = parseInt(id);
    const Model = await hendleModel(type);

    const fetchData = await findOne(actId, Model);

    if (!fetchData) {
      return Response.success({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.DATA_NOT_AVAILABLE,
      });
    }
    const fetchReference = await Reference.find(
      {
        clientRelationId: fetchData._id,
      },
      {
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
      }
    );
    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.SUCCESS,
      data: fetchReference,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  fetchReferences,
};
