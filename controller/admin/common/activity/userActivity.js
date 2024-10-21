const User = require("../../../../model/user/user");
const Movement = require("../../../../model/movement/movement");
const { handleException } = require("../../../../helper/exception");
const Response = require("../../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../../helper/constant");

const generateDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

const getDayOfWeek = (date) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date(date).getDay()];
};

const userActivity = async (req, res) => {
  const { logger, query } = req;
  try {
    let { startDate, endDate } = query;

    const currentWeekStart = new Date();
    currentWeekStart.setUTCHours(0, 0, 0, 0);
    currentWeekStart.setUTCDate(
      currentWeekStart.getUTCDate() - currentWeekStart.getUTCDay()
    );

    if (startDate && endDate) {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
      endDate.setDate(endDate.getDate() + 1);
    }

    const dateRange =
      startDate && endDate ? generateDateRange(startDate, endDate) : [];

    const userAggregationPipeline = [
      {
        $facet: {
          totalUsers: [
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
          filteredUsers: [
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
          currentWeekUsers: [
            {
              $match: { createdAt: { $gte: currentWeekStart } },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
          newUsersGraf: [
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                  day: { $dayOfMonth: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
            },
            {
              $project: {
                date: {
                  $dateFromParts: {
                    year: "$_id.year",
                    month: "$_id.month",
                    day: "$_id.day",
                  },
                },
                count: 1,
                _id: 0,
              },
            },
          ],
          deactivatedUserGraf: [
            {
              $match: {
                isBlocked: true,
                createdAt: { $gte: startDate, $lte: endDate },
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                  day: { $dayOfMonth: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
            },
            {
              $project: {
                date: {
                  $dateFromParts: {
                    year: "$_id.year",
                    month: "$_id.month",
                    day: "$_id.day",
                  },
                },
                count: 1,
                _id: 0,
              },
            },
          ],
        },
      },
      {
        $project: {
          totalUsers: {
            $ifNull: [{ $arrayElemAt: ["$totalUsers.count", 0] }, 0],
          },
          userCount: {
            $ifNull: [{ $arrayElemAt: ["$filteredUsers.count", 0] }, 0],
          },
          currentWeekUsers: {
            $ifNull: [{ $arrayElemAt: ["$currentWeekUsers.count", 0] }, 0],
          },
          userCountPercent: {
            $cond: {
              if: { $gt: [{ $arrayElemAt: ["$totalUsers.count", 0] }, 0] },
              then: {
                $multiply: [
                  {
                    $divide: [
                      { $arrayElemAt: ["$filteredUsers.count", 0] },
                      { $arrayElemAt: ["$totalUsers.count", 0] },
                    ],
                  },
                  100,
                ],
              },
              else: 0,
            },
          },
          currentWeekUsersPercent: {
            $cond: {
              if: { $gt: [{ $arrayElemAt: ["$totalUsers.count", 0] }, 0] },
              then: {
                $multiply: [
                  {
                    $divide: [
                      { $arrayElemAt: ["$currentWeekUsers.count", 0] },
                      { $arrayElemAt: ["$totalUsers.count", 0] },
                    ],
                  },
                  100,
                ],
              },
              else: 0,
            },
          },
          newUsersGraf: 1,
          deactivatedUserGraf: 1,
        },
      },
    ];

    const movementAggregationPipeline = [
      {
        $facet: {
          newMovements: [
            { $match: { status: "NewAssignements" } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
          activeMovements: [
            {
              $match: { status: { $in: ["InProgress", "Pending"] } },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
          pendingMovements: [
            {
              $match: { status: "NewAssignements" },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
      {
        $project: {
          newMovements: {
            $ifNull: [{ $arrayElemAt: ["$newMovements.count", 0] }, 0],
          },
          activeMovements: {
            $ifNull: [{ $arrayElemAt: ["$activeMovements.count", 0] }, 0],
          },
          pendingMovements: {
            $ifNull: [{ $arrayElemAt: ["$pendingMovements.count", 0] }, 0],
          },
        },
      },
    ];

    const getUserStats = await User.aggregate(userAggregationPipeline);
    const getMovementStats = await Movement.aggregate(
      movementAggregationPipeline
    );

    const userStats = getUserStats[0] || {
      totalUsers: 0,
      userCount: 0,
      userCountPercent: 0,
      currentWeekUsers: 0,
      currentWeekUsersPercent: 0,
      newUsersGraf: [],
    };

    const movementStats = getMovementStats[0] || {
      newMovements: 0,
      activeMovements: 0,
      pendingMovements: 0,
    };

    const addMissingDates = (grafData) => {
      const completeGraf = dateRange.map((date) => {
        const formattedDate = new Date(date).toISOString().split("T")[0];
        const dayOfWeek = getDayOfWeek(date);
        const existingData = grafData.find(
          (item) =>
            new Date(item.date).toISOString().split("T")[0] === formattedDate
        );
        return {
          date: formattedDate,
          dayOfWeek: dayOfWeek,
          count: existingData ? existingData.count : 0,
        };
      });

      return completeGraf;
    };

    const result = {
      ...userStats,
      ...movementStats,
      newUsersGraf: addMissingDates(userStats.newUsersGraf),
      deactivatedUserGraf: addMissingDates(userStats.deactivatedUserGraf),
    };

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.SUCCESS,
      data: result,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  userActivity,
};
