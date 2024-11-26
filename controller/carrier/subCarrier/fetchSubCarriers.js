const Carrier = require("../../../model/carrier/carrier");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { STATUS_CODE, INFO_MSGS } = require("../../../helper/constant");
const { ObjectId } = require("mongoose").Types;

const fetchSubCarriers = async (req, res) => {
  let { logger, carrierId } = req;
  try {
    let getData = await Carrier.aggregate([
      {
        $match: {
          parentId: new ObjectId(carrierId),
        },
      },
      {
        $project: {
          __v: 0,
          password: 0,
          forgotPassword: 0,
          token: 0,
        },
      },
    ]);
    return Response.success({
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.SUCCESS,
      data: getData,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  fetchSubCarriers,
};
