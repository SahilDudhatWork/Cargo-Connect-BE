const { handleException } = require("../../../../helper/exception");
const Response = require("../../../../helper/response");
const { hendleModel } = require("../../../../utils/hendleModel");
const { findOne } = require("../../../../utils/helper");
const { decrypt } = require("../../../../helper/encrypt-decrypt");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../../helper/constant");

const getDetails = async (req, res) => {
  const { logger, params } = req;
  try {
    const { type, id } = params;
    let getData;
    const actId = parseInt(id);
    const Model = await hendleModel(type);
    if (type === "carrier") {
      getData = await Model.aggregate([
        { $match: { accountId: actId } },
        {
          $lookup: {
            from: "operators",
            localField: "_id",
            foreignField: "carrierId",
            as: "operatorDetails",
          },
        },
        {
          $lookup: {
            from: "vehicles",
            localField: "_id",
            foreignField: "carrierId",
            as: "vehiclesDetails",
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
          $addFields: {
            "operator.total": { $size: "$operatorDetails" },
            "operator.active": {
              $size: {
                $filter: {
                  input: "$operatorDetails",
                  as: "operator",
                  cond: { $eq: ["$$operator.status", "Active"] },
                },
              },
            },
            "operator.deactive": {
              $size: {
                $filter: {
                  input: "$operatorDetails",
                  as: "operator",
                  cond: { $eq: ["$$operator.status", "Deactive"] },
                },
              },
            },
            "vehicle.total": { $size: "$vehiclesDetails" },
            "vehicle.active": {
              $size: {
                $filter: {
                  input: "$vehiclesDetails",
                  as: "vehicle",
                  cond: { $eq: ["$$vehicle.status", "Active"] },
                },
              },
            },
            "vehicle.deactive": {
              $size: {
                $filter: {
                  input: "$vehiclesDetails",
                  as: "vehicle",
                  cond: { $eq: ["$$vehicle.status", "Deactive"] },
                },
              },
            },
          },
        },
        {
          $project: {
            operatorDetails: 0,
            vehiclesDetails: 0,
            __v: 0,
            forgotPassword: 0,
            token: 0,
            "commercialReference.__v": 0,
            "commercialReference.createdAt": 0,
            "commercialReference.updatedAt": 0,
          },
        },
      ]);
    } else {
      getData = await Model.aggregate([
        { $match: { accountId: actId } },
        {
          $lookup: {
            from: "references",
            localField: "_id",
            foreignField: "clientRelationId",
            as: "commercialReference",
          },
        },

        {
          $project: {
            __v: 0,
            forgotPassword: 0,
            token: 0,
            "commercialReference.__v": 0,
            "commercialReference.createdAt": 0,
            "commercialReference.updatedAt": 0,
          },
        },
      ]);
    }
    getData = getData[0];

    const decryptPassword = decrypt(
      getData.password,
      process.env.PASSWORD_ENCRYPTION_KEY
    );
    getData.password = decryptPassword;

    const statusCode = getData ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message = getData ? INFO_MSGS.SUCCESS : ERROR_MSGS.DATA_NOT_FOUND;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: getData || null,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  getDetails,
};
