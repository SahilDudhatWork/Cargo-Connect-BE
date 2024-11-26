const User = require("../../../model/user/user");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  INFO_MSGS,
  ERROR_MSGS,
} = require("../../../helper/constant");

const getDetails = async (req, res) => {
  let { logger, params } = req;
  try {
    const { id } = params;
    const actId = parseInt(id);

    const [getData] = await User.aggregate([
      { $match: { accountId: actId } },
      {
        $project: {
          __v: 0,
          forgotPassword: 0,
          token: 0,
        },
      },
    ]);

    const statusCode = getData ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message = getData ? INFO_MSGS.SUCCESS : ERROR_MSGS.DATA_NOT_FOUND;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: getData || null,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  getDetails,
};
