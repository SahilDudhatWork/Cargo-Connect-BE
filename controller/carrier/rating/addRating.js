const Rating = require("../../../model/movement/rating");
const Movement = require("../../../model/movement/movement");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const addOrUpdateRating = async (req, res) => {
  const { logger, params, body } = req;
  try {
    const { movementId } = params;

    // Find movement data based on movementId
    const movementData = await Movement.findOne({ movementId: movementId });
    if (!movementData) {
      return Response.error({
        req,
        res,
        status: STATUS_CODE.NOT_FOUND,
        msg: ERROR_MSGS.NOT_FOUND,
      });
    }

    body.movementId = movementData._id;

    // Check if the rating already exists for this movementId
    const existingRating = await Rating.findOne({
      movementId: movementData._id,
    });

    let saveData;
    let message;
    let statusCode;

    if (existingRating) {
      // Update the existing rating
      saveData = await Rating.findByIdAndUpdate(existingRating._id, body, {
        new: true,
      });
      message = INFO_MSGS.UPDATED_SUCCESSFULLY;
      statusCode = STATUS_CODE.OK;
    } else {
      // Create a new rating
      saveData = await Rating.create(body);
      message = INFO_MSGS.CREATED_SUCCESSFULLY;
      statusCode = STATUS_CODE.CREATED;
    }

    return Response.success({
      req,
      res,
      status: statusCode,
      msg: message,
      data: saveData,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  addOrUpdateRating,
};
