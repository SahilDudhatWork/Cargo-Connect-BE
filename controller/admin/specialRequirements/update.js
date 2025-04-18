const SpecialRequirements = require("../../../model/common/specialRequirements");
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

    const existingData = await SpecialRequirements.findById(id);
    if (!existingData) {
      return Response.error({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.NOT_FOUND,
        data: null,
      });
    }

    const mergedRequirements = new Map();

    existingData.requirements.forEach((req) => {
      mergedRequirements.set(req._id.toString(), req);
    });

    body.requirements.forEach((req) => {
      if (req._id) {
        if (mergedRequirements.has(req._id.toString())) {
          // Update existing entry
          mergedRequirements.set(req._id.toString(), {
            ...mergedRequirements.get(req._id.toString()),
            ...req,
          });
        } else {
          // Add new entry
          mergedRequirements.set(req._id.toString(), req);
        }
      } else {
        mergedRequirements.set(`${Date.now()}-${Math.random()}`, req);
      }
    });

    const updatedRequirements = Array.from(mergedRequirements.values());
    function cleanRequirements(data) {
      return data.map((item) => {
        const { type, price, _id } = item;
        return { type, price, _id };
      });
    }
    const cleanedRequirements = cleanRequirements(updatedRequirements);

    const payload = {
      port_bridge: body.port_bridge || existingData.port_bridge,
      requirements: cleanedRequirements,
    };

    const updatedDoc = await SpecialRequirements.findByIdAndUpdate(
      id,
      payload,
      { new: true }
    );

    const statusCode = updatedDoc ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = updatedDoc
      ? INFO_MSGS.UPDATED_SUCCESSFULLY
      : ERROR_MSGS.UPDATE_ERR;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: updatedDoc || null,
    });
  } catch (error) {
    console.log("error :>> ", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  update,
};
