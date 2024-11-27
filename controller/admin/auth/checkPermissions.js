const Admin = require("../../../model/admin/admin");
const { ObjectId } = require("mongoose").Types;
const Response = require("../../../helper/response");
const { STATUS_CODE, INFO_MSGS } = require("../../../helper/constant");
const { handleException } = require("../../../helper/exception");

const checkPermissions = async (req, res) => {
  const { logger, adminId } = req;
  try {
    let getData = await Admin.aggregate([
      {
        $match: { _id: new ObjectId(adminId) },
      },
      {
        $lookup: {
          from: "adminroles",
          localField: "roleByAdmin",
          foreignField: "_id",
          as: "adminRoles",
        },
      },
      { $unwind: "$adminRoles" },
      {
        $unwind: {
          path: "$adminRoles.access",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "menuaccesses",
          localField: "adminRoles.access.menuId",
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
          _id: null,
          menuDetails: {
            $addToSet: {
              menuId: "$adminRoles.access.menuId",
              menuTitle: "$menuDetails.menuTitle",
              to: "$menuDetails.to",
              add: "$adminRoles.access.add",
              read: "$adminRoles.access.read",
              edit: "$adminRoles.access.edit",
              delete: "$adminRoles.access.delete",
            },
          },
          roleTitle: { $first: "$adminRoles.roleTitle" },
        },
      },
      {
        $project: {
          _id: 0,
          menuDetails: 1,
          roleTitle: 1,
        },
      },
    ]);

    const obj = {
      res,
      msg: INFO_MSGS.SUCCESS,
      status: STATUS_CODE.OK,
      data: getData.length > 0 ? getData[0] : {},
    };
    return Response.success(obj);
  } catch (error) {
    console.log("Login Error : ", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  checkPermissions,
};
