const MenuAccess = require("../../../model/admin/menuAccess");
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

    const updatedData = await MenuAccess.findByIdAndUpdate(id, body, {
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
