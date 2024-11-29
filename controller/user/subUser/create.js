const User = require("../../../model/user/user");
const { handleException } = require("../../../helper/exception");
const { encrypt } = require("../../../helper/encrypt-decrypt");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const { generateAccountId } = require("../../../utils/generateUniqueId");
const {
  STATUS_CODE,
  INFO_MSGS,
  ERROR_MSGS,
} = require("../../../helper/constant");

const createSubUser = async (req, res) => {
  let { logger, userId, body } = req;
  try {
    const {
      contactName,
      contactNumber,
      countryCode,
      email,
      password,
      deviceToken,
      webToken,
    } = body;

    const userEmailExist = await User.findOne({ email });
    if (userEmailExist) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_EXISTS,
      });
    }

    let [getUser] = await User.aggregate([
      {
        $match: {
          _id: new ObjectId(userId),
        },
      },
      {
        $project: {
          __v: 0,
        },
      },
    ]);

    if (getUser.userType === "SubUser") {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.INSUFFICIENT_PERMISSION,
      });
    }

    const passwordHash = encrypt(password, process.env.PASSWORD_ENCRYPTION_KEY);

    const payload = {
      accountId: generateAccountId(),
      parentId: userId,
      userType: "SubUser",
      profilePicture: getUser.profilePicture,
      companyName: getUser.companyName,
      contactName,
      contactNumber,
      countryCode,
      email,
      deviceToken,
      webToken,
      password: passwordHash,
      profilePicture: getUser.profilePicture,
      scac: getUser.scac,
      caat: getUser.caat,
      insurancePolicy: getUser.insurancePolicy,
      oea: getUser.oea,
      ctpat: getUser.ctpat,
      companyFormationType: getUser.companyFormationType,
      companyFormation: getUser.companyFormation,
      stepCompleted: getUser.stepCompleted,
      verifyByAdmin: getUser.verifyByAdmin,
      isBlocked: getUser.isBlocked,
    };

    const savedata = await User.create(payload);
    return Response.success({
      res,
      status: STATUS_CODE.CREATED,
      msg: INFO_MSGS.CREATED_SUCCESSFULLY,
      data: savedata,
    });
  } catch (error) {
    console.error("error-->", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  createSubUser,
};
