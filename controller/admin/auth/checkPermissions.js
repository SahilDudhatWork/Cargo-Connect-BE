const Admin = require("../../../model/admin/admin");
const MenuAccess = require("../../../model/admin/menuAccess");
const { ObjectId } = require("mongoose").Types;
const Response = require("../../../helper/response");
const { STATUS_CODE, INFO_MSGS } = require("../../../helper/constant");
const { handleException } = require("../../../helper/exception");

const checkPermissions = async (req, res) => {
  const { logger, adminId } = req;
  try {
    const getData = await Admin.findById(adminId);
    let result = !getData.roleByAdmin
      ? {
          menuDetails: await MenuAccess.find(
            {},
            { createdAt: 0, updatedAt: 0, __v: 0 }
          ).then((menus) =>
            menus.map((menu) => ({
              ...menu.toObject(),
              add: true,
              read: true,
              edit: true,
              delete: true,
            }))
          ),
          roleTitle: "Full Permission",
        }
      : await Admin.aggregate([
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
        ]).then(([result]) => result);

    const obj = {
      res,
      msg: INFO_MSGS.SUCCESS,
      status: STATUS_CODE.OK,
      data: result,
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
