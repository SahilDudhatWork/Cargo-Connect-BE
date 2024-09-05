const Carrier = require("../../../../model/carrier/carrier");
const Movement = require("../../../../model/movement/movement");
const { handleException } = require("../../../../helper/exception");
const Response = require("../../../../helper/response");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../../helper/constant");

const carrierActivity = async (req, res) => {
  const { logger, query } = req;
  try {
    let { startDate, endDate } = query;

    const currentWeekStart = new Date();
    currentWeekStart.setUTCHours(0, 0, 0, 0);
    currentWeekStart.setUTCDate(
      currentWeekStart.getUTCDate() - currentWeekStart.getUTCDay()
    );

    let qry = {};
    if (startDate && endDate) {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
      endDate.setDate(endDate.getDate() + 1);
      qry["$and"] = [
        { createdAt: { $gte: startDate } },
        { createdAt: { $lte: endDate } },
      ];
    }

    const carrierAggregationPipeline = [
      {
        $facet: {
          totalCarriers: [
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
          totalCarriers: {
            $ifNull: [{ $arrayElemAt: ["$totalCarriers.count", 0] }, 0],
          },
        },
      },
    ];

    const movementAggregationPipeline = [
      {
        $facet: {
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

    const getCarrierStats = await Carrier.aggregate(carrierAggregationPipeline);
    const getMovementStats = await Movement.aggregate(
      movementAggregationPipeline
    );

    const result = {
      ...(getCarrierStats[0] || {
        totalCarriers: 0,
        carrierCount: 0,
        carrierCountPercent: 0,
        currentWeekCarriers: 0,
        currentWeekCarriersPercent: 0,
        newCarriersGraf: [],
      }),
      ...(getMovementStats[0] || {
        newMovements: 0,
        activeMovements: 0,
        pendingMovements: 0,
      }),
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
  carrierActivity,
};
