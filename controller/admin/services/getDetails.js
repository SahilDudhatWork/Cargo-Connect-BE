const Movement = require("../../../model/user/movement");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const getDetails = async (req, res) => {
  const { logger } = req;
  try {
    const { id } = req.params;

    let getData = await Movement.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          let: { operatorId: "$operatorId" },
          from: "operators",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$operatorId"] },
              },
            },
            // { $project: { _id: 1, operatorNumber: 1, operatorName: 1 } },
          ],
          as: "operatorsData",
        },
      },
      {
        $unwind: {
          path: "$operatorsData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          let: { vehicleId: "$vehicleId" },
          from: "vehicles",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$vehicleId"] },
              },
            },
          ],
          as: "vehicleData",
        },
      },
      {
        $unwind: {
          path: "$vehicleData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          __v: 0,
        },
      },
    ]);

    getData = getData[0];

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
