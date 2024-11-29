const Admin = require("../../../model/admin/admin");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const getAdmins = async (req, res) => {
  let { logger } = req;
  try {
    let getData = await Admin.aggregate([
      {
        $match: {
          roleByAdmin: { $ne: null },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "adminroles",
          localField: "roleByAdmin",
          foreignField: "_id",
          as: "adminRoles",
        },
      },
      {
        $unwind: {
          path: "$adminRoles",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          contactName: 1,
          email: 1,
          lastLogin: 1,
          roleByAdmin: 1,
          createdAt: 1,
          updatedAt: 1,
          forgotPassword: 1,
          role: { $ifNull: ["$adminRoles.roleTitle", null] },
        },
      },
    ]);

    const statusCode = getData.length > 0 ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message =
      getData.length > 0 ? INFO_MSGS.SUCCESS : ERROR_MSGS.DATA_NOT_FOUND;

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
  getAdmins,
};
