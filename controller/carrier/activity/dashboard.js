const Operator = require("../../../model/operator/operator");
const Vehicles = require("../../../model/vehicle/vehicle");
const Movements = require("../../../model/movement/movement");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const { STATUS_CODE, INFO_MSGS } = require("../../../helper/constant");

const getRecap = async (startDate, endDate, carrierId) => {
  return Movements.aggregate([
    {
      $match: {
        carrierId: new ObjectId(carrierId),
        createdAt: {
          $gte: new Date(startDate),
          $lt: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        status: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ]);
};

const formatRecap = (recapData) => {
  const completed = recapData.find((r) => r.status === "Completed")?.count || 0;
  const inProgress = recapData
    .filter((r) => ["InProgress", "Pending"].includes(r.status))
    .reduce((sum, r) => sum + r.count, 0);
  const canceled = recapData.find((r) => r.status === "Cancelled")?.count || 0;
  const total = recapData.reduce((sum, r) => sum + r.count, 0);

  return { total, completed, inProgress, canceled };
};

const validateDates = (startDate, endDate) => {
  if (!startDate && !endDate) {
    return true;
  }
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) {
      return false;
    }
    if (end < start) {
      return false;
    }
    return true;
  }
  return false;
};

const dashboard = async (req, res) => {
  const { logger, query, carrierId } = req;
  try {
    let { startDate, endDate } = query;

    if (!validateDates(startDate, endDate)) {
      return Response.error({
        req,
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: "Please provide both a start date and an end date, or leave both blank. IfBoth startDate and endDate must be provided, or both can be empty. If provided, both must be valid dates, and endDate should not be earlier than startDate.",
      });
    }

    const now = new Date();
    const lastDayStart = new Date(now);
    lastDayStart.setDate(lastDayStart.getDate() - 1);
    lastDayStart.setUTCHours(0, 0, 0, 0);

    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    lastWeekStart.setUTCHours(0, 0, 0, 0);

    const lastMonthStart = new Date(now);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setUTCHours(0, 0, 0, 0);

    let [
      operatorResult,
      vehiclesResult,
      lastDayRecap,
      lastWeekRecap,
      lastMonthRecap,
      servicesSummary,
    ] = await Promise.all([
      Operator.aggregate([
        {
          $match: {
            carrierId: new ObjectId(carrierId),
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
            },
            deactive: {
              $sum: {
                $cond: [{ $eq: ["$status", "Deactive"] }, 1, 0],
              },
            },
          },
        },
      ]),
      Vehicles.aggregate([
        {
          $match: {
            carrierId: new ObjectId(carrierId),
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
            },
            deactive: {
              $sum: {
                $cond: [{ $eq: ["$status", "Deactive"] }, 1, 0],
              },
            },
          },
        },
      ]),
      getRecap(lastDayStart, now, carrierId),
      getRecap(lastWeekStart, now, carrierId),
      getRecap(lastMonthStart, now, carrierId),
      Movements.aggregate([
        {
          $match: {
            carrierId: new ObjectId(carrierId),
          },
        },
        ...(startDate &&
        endDate &&
        startDate.trim() !== "" &&
        endDate.trim() !== ""
          ? [
              {
                $match: {
                  createdAt: {
                    $gte: new Date(startDate),
                    $lt: new Date(endDate),
                  },
                },
              },
            ]
          : []),
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            status: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ]),
    ]);

    const finalResult = {
      last_Day_Recap: formatRecap(lastDayRecap),
      last_Week_Recap: formatRecap(lastWeekRecap),
      last_Month_Recap: formatRecap(lastMonthRecap),
      operators: {
        total: operatorResult[0]?.total || 0,
        active: operatorResult[0]?.active || 0,
        deactive: operatorResult[0]?.deactive || 0,
      },
      vehicles: {
        total: vehiclesResult[0]?.total || 0,
        active: vehiclesResult[0]?.active || 0,
        deactive: vehiclesResult[0]?.deactive || 0,
      },
      services: formatRecap(servicesSummary),
    };

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.SUCCESS,
      data: finalResult,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  dashboard,
};
