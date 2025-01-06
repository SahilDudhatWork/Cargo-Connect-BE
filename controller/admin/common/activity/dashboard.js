const Users = require("../../../../model/user/user");
const Carriers = require("../../../../model/carrier/carrier");
const Operator = require("../../../../model/operator/operator");
const Vehicles = require("../../../../model/vehicle/vehicle");
const Movements = require("../../../../model/movement/movement");
const { handleException } = require("../../../../helper/exception");
const Response = require("../../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../../helper/constant");

const getRecap = async (startDate, endDate) => {
  return Movements.aggregate([
    {
      $match: {
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
  const { logger, query } = req;
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
      usersResult,
      carriersResult,
      operatorResult,
      vehiclesResult,
      lastDayRecap,
      lastWeekRecap,
      lastMonthRecap,
      servicesSummary,
    ] = await Promise.all([
      Users.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            verify: {
              $sum: { $cond: [{ $eq: ["$verifyByAdmin", true] }, 1, 0] },
            },
            unverify: {
              $sum: {
                $cond: [{ $eq: ["$verifyByAdmin", false] }, 1, 0],
              },
            },
          },
        },
      ]),
      Carriers.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            verify: {
              $sum: { $cond: [{ $eq: ["$verifyByAdmin", true] }, 1, 0] },
            },
            unverify: {
              $sum: {
                $cond: [{ $eq: ["$verifyByAdmin", false] }, 1, 0],
              },
            },
          },
        },
      ]),
      Operator.aggregate([
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
      getRecap(lastDayStart, now),
      getRecap(lastWeekStart, now),
      getRecap(lastMonthStart, now),
      Movements.aggregate([
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
      users: {
        total: usersResult[0]?.total || 0,
        verify: usersResult[0]?.verify || 0,
        unverify: usersResult[0]?.unverify || 0,
      },
      carriers: {
        total: carriersResult[0]?.total || 0,
        verify: carriersResult[0]?.verify || 0,
        unverify: carriersResult[0]?.unverify || 0,
      },
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
