const Movement = require("../../../model/movement/movement");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const referenceValidate = async (req, res) => {
  let { logger, userId, body } = req;
  try {
    let { userReference } = body;

    if (userReference.length > 10) {
      return Response.error({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.USER_REFERENCE_LIMIT,
      });
    }

    let checkUserReferenceExist = await Movement.aggregate([
      {
        $match: { userId: new ObjectId(userId), userReference: userReference },
      },
      { $project: { _id: 1 } },
      { $limit: 1 },
    ]);

    if (checkUserReferenceExist.length > 0) {
      return Response.error({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.USER_REFERENCE_EXIST,
      });
    }

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.SUCCESS,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  referenceValidate,
};
