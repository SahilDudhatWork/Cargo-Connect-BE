const MenuAccess = require("../../../model/carrier/menuAccess");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const getMenus = async (req, res) => {
  let { logger } = req;
  try {
    let getData = await MenuAccess.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $project: {
          __v: 0,
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
      data: getData,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  getMenus,
};
