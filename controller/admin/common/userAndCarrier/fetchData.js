const { handleException } = require("../../../../helper/exception");
const Response = require("../../../../helper/response");
const { paginationResponse } = require("../../../../utils/paginationFormate");
const { hendleModel } = require("../../../../utils/hendleModel");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../../helper/constant");

const fetchData = async (req, res) => {
  let { logger, params, query } = req;
  try {
    let { keyWord, page, limit, sortBy } = query;
    const { type } = params;

    const Model = await hendleModel(type);

    let qry = {};

    if (keyWord) {
      qry = {
        $or: [
          { companyName: { $regex: keyWord, $options: "i" } },
          { contactName: { $regex: keyWord, $options: "i" } },
          { email: { $regex: keyWord, $options: "i" } },
          { contactNumber: { $regex: keyWord, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: { $toLong: "$accountId" } },
                regex: keyWord,
              },
            },
          },
        ],
      };
    }

    let sortCriteria = {};
    if (sortBy === "recent") {
      sortCriteria = { createdAt: -1 };
    } else if (sortBy === "blocked") {
      qry.verifyByAdmin = false;
      sortCriteria = { createdAt: -1 };
    } else if (sortBy === "all") {
      sortCriteria = { createdAt: -1 };
    } else {
      sortCriteria = { createdAt: 1 };
    }

    const offset = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = limit * (offset - 1);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const capitalType = type.charAt(0).toUpperCase() + type.slice(1);

    const getData = await Model.aggregate([
      { $match: qry },
      { $sort: sortCriteria },
      {
        $lookup: {
          from: "movements",
          let: { newId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: [`$${type}Id`, "$$newId"] }],
                },
              },
            },
            {
              $lookup: {
                from: "ratings",
                let: { ids: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$movementId", "$$ids"] },
                          { $eq: ["$type", capitalType] },
                        ],
                      },
                    },
                  },
                  {
                    $project: {
                      rating: 1,
                      movementId: 1,
                      type: 1,
                    },
                  },
                ],
                as: "rating",
              },
            },
            {
              $unwind: {
                path: "$rating",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $group: {
                _id: null,
                averageRating: { $avg: "$rating.rating" },
                totalCount: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                averageRating: 1,
              },
            },
          ],
          as: "movements",
        },
      },
      {
        $unwind: {
          path: "$movements",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          averageRating: {
            $ifNull: ["$movements.averageRating", 0],
          },
          newRequest: {
            $cond: {
              if: { $gte: ["$createdAt", twentyFourHoursAgo] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $facet: {
          paginatedResult: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                __v: 0,
                token: 0,
                password: 0,
                movements: 0,
                forgotPassword: 0,
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const result = getData[0];
    let response = await paginationResponse(req, res, offset, limit, result);

    const statusCode =
      response.response.length > 0 ? STATUS_CODE.OK : STATUS_CODE.OK;
    const message =
      response.response.length > 0
        ? INFO_MSGS.SUCCESS
        : ERROR_MSGS.DATA_NOT_FOUND;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: response,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  fetchData,
};
