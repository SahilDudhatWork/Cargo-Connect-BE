const Operator = require("../../../model/operator/operator");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const update = async (req, res) => {
  const { logger } = req;
  try {
    const { id } = req.params;

    const updatedData = await Operator.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    const result = updatedData.toObject();
    delete result.password;
    delete result.companyFormation;
    delete result.token;
    delete result.forgotPassword;

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.UPDATED_SUCCESSFULLY,
      data: result,
    });
  } catch (error) {
    console.error("Error :", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  update,
};