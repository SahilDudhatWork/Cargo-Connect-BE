const Operator = require("../../../model/operator/operator");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const createData = async (req, res) => {
  const { logger, operatorId, body } = req;
  try {
    const existingData = await Operator.findById(operatorId);

    if (!existingData) {
      return Response.error({
        req,
        res,
        status: STATUS_CODE.NOT_FOUND,
        msg: ERROR_MSGS.NOT_FOUND,
      });
    }

    let trackingLink = existingData.trackingLink;
    trackingLink = generateGoogleMapsLink(body.lat, body.long);
    
    // if (!existingData?.trackingLink) {
    //   trackingLink = generateGoogleMapsLink(body.lat, body.long);
    // }

    const updateData = await Operator.findByIdAndUpdate(
      operatorId,
      { ...body, trackingLink },
      { new: true }
    );

    const result = updateData.toObject();
    delete result.password;
    delete result.token;
    delete result.__v;

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.UPDATED_SUCCESSFULLY,
      data: result,
    });
  } catch (error) {
    console.error("Error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  createData,
};

const generateGoogleMapsLink = (lat, long) => {
  return `https://www.google.com/maps?q=${lat},${long}`;
};
