const Admin = require("../../../model/admin/admin");
const { decrypt } = require("../../../helper/encrypt-decrypt");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const getDetails = async (req, res) => {
  const { logger, params } = req;
  try {
    const { id } = params;

    let [getData] = await Admin.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "adminroles",
          localField: "roleByAdmin",
          foreignField: "_id",
          as: "adminRoles",
        },
      },
      {
        $unwind: {
          path: "$adminRoles",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          __v: 0,
          token: 0,
        },
      },
    ]);

    getData.password = decrypt(
      getData.password,
      process.env.PASSWORD_ENCRYPTION_KEY
    );

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
