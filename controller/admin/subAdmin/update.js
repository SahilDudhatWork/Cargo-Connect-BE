const Admin = require("../../../model/admin/admin");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const update = async (req, res) => {
  const { logger, params, body } = req;
  try {
    const { id } = params;
    const { password } = body;

    if (password) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: `Password ${ERROR_MSGS.NOT_EDITABLE}`,
      });
    }

    const updatedData = await Admin.findByIdAndUpdate(id, body, {
      new: true,
    });

    const result = updatedData.toObject();
    delete result.password;
    delete result.companyFormation;
    delete result.token;
    delete result.forgotPassword;
    delete result.__v;

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
