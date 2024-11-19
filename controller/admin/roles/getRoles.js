const AdminRole = require("../../../model/admin/adminRole");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const getRoles = async (req, res) => {
  let { logger } = req;
  try {
    let getData = await AdminRole.aggregate([
      {
        $unwind: {
          path: "$access",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "menuaccesses",
          localField: "access.menuId",
          foreignField: "_id",
          as: "menuDetails",
        },
      },
      {
        $unwind: {
          path: "$menuDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          roleTitle: { $first: "$roleTitle" },
          access: {
            $push: {
              menuId: "$access.menuId",
              menuDetails: "$menuDetails",
              read: "$access.read",
              edit: "$access.edit",
              delete: "$access.delete",
            },
          },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
        },
      },
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
  getRoles,
};
