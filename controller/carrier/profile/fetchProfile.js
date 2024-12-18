const Carrier = require("../../../model/carrier/carrier");
const MenuAccess = require("../../../model/carrier/menuAccess");
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
  try {
    let [getData] = await Carrier.aggregate([
      {
        $match: {
          _id: new ObjectId(carrierId),
        },
      },
      {
        $lookup: {
          from: "references",
          localField: "_id",
          foreignField: "clientRelationId",
          as: "commercialReference",
        },
      },
      {
        $lookup: {
          from: "operators",
          localField: "_id",
          foreignField: "carrierId",
          as: "operators",
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "_id",
          foreignField: "carrierId",
          as: "vehicles",
        },
      },
      {
        $addFields: {
          totalOperators: { $size: "$operators" },
          activeOperators: {
            $size: {
              $filter: {
                input: "$operators",
                as: "op",
                cond: { $eq: ["$$op.status", "Active"] },
              },
            },
          },
          deactiveOperators: {
            $size: {
              $filter: {
                input: "$operators",
                as: "op",
                cond: { $eq: ["$$op.status", "Deactive"] },
              },
            },
          },
          totalVehicles: { $size: "$vehicles" },
          activeVehicles: {
            $size: {
              $filter: {
                input: "$vehicles",
                as: "vehicle",
                cond: { $eq: ["$$vehicle.status", "Active"] },
              },
            },
          },
          deactiveVehicles: {
            $size: {
              $filter: {
                input: "$vehicles",
                as: "vehicle",
                cond: { $eq: ["$$vehicle.status", "Deactive"] },
              },
            },
          },
        },
      },
      {
        $project: {
          __v: 0,
          token: 0,
          password: 0,
          forgotPassword: 0,
          "commercialReference.__v": 0,
          "commercialReference.createdAt": 0,
          "commercialReference.updatedAt": 0,
          operators: 0,
          vehicles: 0,
        },
      },
    ]);

    let result =
      getData.carrierType === "Carrier"
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

    let operators = {
      total: getData.totalOperators,
      active: getData.activeOperators,
      deactive: getData.deactiveOperators,
    };
    let vehicles = {
      total: getData.totalVehicles,
      active: getData.activeVehicles,
      deactive: getData.deactiveVehicles,
    };
    getData.operators = operators;
    getData.vehicles = vehicles;

    delete getData.totalOperators;
    delete getData.activeOperators;
    delete getData.deactiveOperators;
    delete getData.totalVehicles;
    delete getData.activeVehicles;
    delete getData.deactiveVehicles;

    const statusCode = getData ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message = getData ? INFO_MSGS.SUCCESS : ERROR_MSGS.DATA_NOT_FOUND;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: { ...getData, ...result },
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  fetchProfile,
};
