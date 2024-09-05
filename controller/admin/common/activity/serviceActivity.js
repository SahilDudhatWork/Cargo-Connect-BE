const Movement = require("../../../../model/movement/movement");
const { handleException } = require("../../../../helper/exception");
const Response = require("../../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../../helper/constant");

const serviceActivity = async (req, res) => {
  const { logger, query } = req;
  try {
    let { startDate, endDate } = query;

    const currentWeekStart = new Date();
    currentWeekStart.setUTCHours(0, 0, 0, 0);
    currentWeekStart.setUTCDate(
      currentWeekStart.getUTCDay() === 0
        ? currentWeekStart.getUTCDate() - 7
        : currentWeekStart.getUTCDate() - currentWeekStart.getUTCDay()
    );

    if (!startDate || !endDate) {
      startDate = currentWeekStart;
      endDate = new Date(currentWeekStart);
      endDate.setDate(endDate.getDate() + 7);
    }

    startDate = new Date(startDate);
    endDate = new Date(endDate);
    endDate.setDate(endDate.getDate() + 1);

    const allDates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      allDates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const formattedDates = allDates.map((date) => ({
      date: date.toISOString().split("T")[0],
      dayOfWeek: new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
        date
      ),
    }));

    const movementAggregationPipeline = [
      {
        $facet: {
          totalMovement: [
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
          filteredMovements: [
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
          newActivityGraf: [
            {
              $match: {
                status: "Pending",
                createdAt: { $gte: startDate, $lte: endDate },
              },
            },
            {
              $group: {
                _id: {
                  date: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                  },
                },
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                date: "$_id.date",
                count: 1,
              },
            },
          ],
          cancelledActivityGraf: [
            {
              $match: {
                status: "Cancelled",
                createdAt: { $gte: startDate, $lte: endDate },
              },
            },
            {
              $group: {
                _id: {
                  date: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                  },
                },
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                date: "$_id.date",
                count: 1,
              },
            },
          ],
          currentWeekMovements: [
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
          newMovements: [
            { $match: { status: "Pending" } },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
          activeMovements: [
            {
              $match: { status: { $in: ["InProgress", "Approved"] } },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
          filteredActiveMovements: [
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            {
              $match: { status: { $in: ["InProgress", "Approved"] } },
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
              $match: { status: "Pending" },
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
          totalMovement: {
            $ifNull: [{ $arrayElemAt: ["$totalMovement.count", 0] }, 0],
          },
          currentWeekMovements: {
            $ifNull: [{ $arrayElemAt: ["$currentWeekMovements.count", 0] }, 0],
          },
          newMovements: {
            $ifNull: [{ $arrayElemAt: ["$newMovements.count", 0] }, 0],
          },
          activeMovements: {
            $ifNull: [{ $arrayElemAt: ["$activeMovements.count", 0] }, 0],
          },
          filteredActiveMovements: {
            $ifNull: [
              { $arrayElemAt: ["$filteredActiveMovements.count", 0] },
              0,
            ],
          },
          pendingMovements: {
            $ifNull: [{ $arrayElemAt: ["$pendingMovements.count", 0] }, 0],
          },
          activityPercent: {
            $cond: {
              if: { $gt: [{ $arrayElemAt: ["$totalMovement.count", 0] }, 0] },
              then: {
                $multiply: [
                  {
                    $divide: [
                      { $arrayElemAt: ["$filteredMovements.count", 0] },
                      { $arrayElemAt: ["$totalMovement.count", 0] },
                    ],
                  },
                  100,
                ],
              },
              else: 0,
            },
          },
          currentWeekActivityPercent: {
            $cond: {
              if: { $gt: [{ $arrayElemAt: ["$totalMovement.count", 0] }, 0] },
              then: {
                $multiply: [
                  {
                    $divide: [
                      { $arrayElemAt: ["$currentWeekMovements.count", 0] },
                      { $arrayElemAt: ["$totalMovement.count", 0] },
                    ],
                  },
                  100,
                ],
              },
              else: 0,
            },
          },
          newActivityGraf: {
            $let: {
              vars: {
                activity: {
                  $map: {
                    input: formattedDates,
                    as: "date",
                    in: {
                      date: "$$date.date",
                      dayOfWeek: "$$date.dayOfWeek",
                      count: {
                        $let: {
                          vars: {
                            matched: {
                              $arrayElemAt: [
                                {
                                  $filter: {
                                    input: "$newActivityGraf",
                                    cond: {
                                      $eq: ["$$this.date", "$$date.date"],
                                    },
                                  },
                                },
                                0,
                              ],
                            },
                          },
                          in: {
                            $ifNull: ["$$matched.count", 0],
                          },
                        },
                      },
                    },
                  },
                },
              },
              in: "$$activity",
            },
          },
          cancelledActivityGraf: {
            $let: {
              vars: {
                activity: {
                  $map: {
                    input: formattedDates,
                    as: "date",
                    in: {
                      date: "$$date.date",
                      dayOfWeek: "$$date.dayOfWeek",
                      count: {
                        $let: {
                          vars: {
                            matched: {
                              $arrayElemAt: [
                                {
                                  $filter: {
                                    input: "$cancelledActivityGraf",
                                    cond: {
                                      $eq: ["$$this.date", "$$date.date"],
                                    },
                                  },
                                },
                                0,
                              ],
                            },
                          },
                          in: {
                            $ifNull: ["$$matched.count", 0],
                          },
                        },
                      },
                    },
                  },
                },
              },
              in: "$$activity",
            },
          },
        },
      },
    ];

    const result = await Movement.aggregate(movementAggregationPipeline);

    return Response.success({
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.GET_SUCCESS,
      data: result[0],
    });
  } catch (err) {
    return handleException(err, logger, res);
  }
};

module.exports = {
  serviceActivity,
};
