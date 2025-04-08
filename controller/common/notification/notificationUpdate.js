const Notification = require("../../../model/common/notification");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { STATUS_CODE, INFO_MSGS } = require("../../../helper/constant");

const notificationUpdate = async (req, res) => {
  const { logger, params } = req;
  try {
    const { id } = params;
    await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.SUCCESS,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  notificationUpdate,
};
