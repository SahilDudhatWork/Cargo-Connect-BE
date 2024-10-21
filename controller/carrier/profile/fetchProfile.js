const Carrier = require("../../../model/carrier/carrier");
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
    let getData = await Carrier.aggregate([
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

    getData = getData[0];

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
      data: getData,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  fetchProfile,
};
