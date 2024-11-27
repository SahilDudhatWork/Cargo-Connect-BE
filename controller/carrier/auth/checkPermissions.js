const Carrier = require("../../../model/carrier/carrier");
// const MenuAccess = require("../../../model/carrier/menuAccess");
const { ObjectId } = require("mongoose").Types;
const Response = require("../../../helper/response");
const { STATUS_CODE, INFO_MSGS } = require("../../../helper/constant");
const { handleException } = require("../../../helper/exception");

const checkPermissions = async (req, res) => {
  const { logger, carrierId } = req;
  try {
    const getData = await Carrier.findById(carrierId);
    let result =
      getData.carrierType === "Carrier"
        ? {
            // menuDetails: await MenuAccess.find(
            //   {},
            //   { createdAt: 0, updatedAt: 0, __v: 0 }
            // ).then((menus) =>
            //   menus.map((menu) => ({
            //     ...menu.toObject(),
            //     add: true,
            //     read: true,
            //     edit: true,
            //     delete: true,
            //   }))
            // ),
            roleTitle: "Full Permission",
          }
        : await Carrier.aggregate([
            { $match: { _id: new ObjectId(carrierId) } },
            {
              $lookup: {
                from: "carrierroles",
                localField: "roleByCarrier",
                foreignField: "_id",
                as: "carrierRoles",
              },
            },
            { $unwind: "$carrierRoles" },
            {
              $unwind: {
                path: "$carrierRoles.access",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "carreirmenuaccesses",
                localField: "carrierRoles.access.menuId",
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
                    menuId: "$carrierRoles.access.menuId",
                    menuTitle: "$menuDetails.menuTitle",
                    to: "$menuDetails.to",
                    add: "$carrierRoles.access.add",
                    read: "$carrierRoles.access.read",
                    edit: "$carrierRoles.access.edit",
                    delete: "$carrierRoles.access.delete",
                  },
                },
                roleTitle: { $first: "$carrierRoles.roleTitle" },
              },
            },
            { $project: { _id: 0, menuDetails: 1, roleTitle: 1 } },
          ]).then(([result]) => result);

    return Response.success({
      res,
      msg: INFO_MSGS.SUCCESS,
      status: STATUS_CODE.OK,
      data: result,
    });
  } catch (error) {
    return handleException(logger, res, error);
  }
};

module.exports = {
  checkPermissions,
};
