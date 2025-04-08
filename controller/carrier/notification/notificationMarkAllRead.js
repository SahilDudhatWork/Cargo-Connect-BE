const Notification = require("../../../model/common/notification");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const { STATUS_CODE, INFO_MSGS } = require("../../../helper/constant");

const notificationMarkAllRead = async (req, res) => {
  const { logger, carrierId } = req;
  try {
    await Notification.updateMany(
      { clientRelationId: new ObjectId(carrierId), collection: "Carriers" },
      { isRead: true },
      { new: true }
    );

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
  notificationMarkAllRead,
};
