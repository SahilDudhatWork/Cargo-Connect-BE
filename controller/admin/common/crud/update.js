const { handleException } = require("../../../../helper/exception");
const Response = require("../../../../helper/response");
const { hendleModel } = require("../../../../utils/hendleModel");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../../helper/constant");

const update = async (req, res) => {
  const { logger } = req;

  try {
    const { type, id } = req.params;
    const { email } = req.body;

    const Model = await hendleModel(res, type);

    const existingData = await Model.findById(id);
    if (!existingData) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.DATA_NOT_AVAILABLE,
      });
    }

    const emailInUse = await Model.findOne({ email });
    if (emailInUse && !emailInUse._id.equals(id)) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.EMAIL_EXIST,
      });
    }

    const updatedData = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedData) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.UPDATE_ERR,
      });
    }

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.UPDATED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error("Error :", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  update,
};
