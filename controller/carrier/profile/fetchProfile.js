const Carrier = require("../../../model/carrier/carrier");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const fetchProfile = async (req, res) => {
  let { logger, carrierId } = req;
  console.log('carrierId :>> ', carrierId);
  try {
    let getData = await Carrier.aggregate([
      {
        $match: {
          _id: new ObjectId(carrierId),
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

    getData = getData[0];
    const statusCode = getData ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message = getData ? INFO_MSGS.SUCCESS : ERROR_MSGS.DATA_NOT_FOUND;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: getData,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  fetchProfile,
};
