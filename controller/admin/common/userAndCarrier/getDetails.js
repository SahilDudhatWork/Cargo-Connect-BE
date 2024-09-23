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
    const Model = await hendleModel(res, type);
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
          $project: {
            __v: 0,
            forgotPassword: 0,
            token: 0,
            "operatorDetails.token": 0,
            "operatorDetails.__v": 0,
          },
        },
      ]);
      getData = getData[0];
    } else {
      getData = await findOne(actId, Model);
    }

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
