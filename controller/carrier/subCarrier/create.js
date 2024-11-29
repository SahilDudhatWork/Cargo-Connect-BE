const Carrier = require("../../../model/carrier/carrier");
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

const createSubCarrier = async (req, res) => {
  let { logger, carrierId, body } = req;
  try {
    const {
      contactName,
      contactNumber,
      countryCode,
      email,
      password,
      deviceToken,
      webToken,
      roleByCarrier,
    } = body;

    const carrierEmailExist = await Carrier.findOne({ email });
    if (carrierEmailExist) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_EXISTS,
      });
    }

    let [getCarrier] = await Carrier.aggregate([
      {
        $match: {
          _id: new ObjectId(carrierId),
        },
      },
      {
        $project: {
          __v: 0,
        },
      },
    ]);

    if (getCarrier.carrierType === "SubCarrier") {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.INSUFFICIENT_PERMISSION,
      });
    }

    const passwordHash = encrypt(password, process.env.PASSWORD_ENCRYPTION_KEY);

    const payload = {
      accountId: generateAccountId(),
      parentId: carrierId,
      carrierType: "SubCarrier",
      profilePicture: getCarrier.profilePicture,
      companyName: getCarrier.companyName,
      contactName,
      contactNumber,
      countryCode,
      email,
      deviceToken,
      webToken,
      roleByCarrier,
      password: passwordHash,
      profilePicture: getCarrier.profilePicture,
      scac: getCarrier.scac,
      caat: getCarrier.caat,
      insurancePolicy: getCarrier.insurancePolicy,
      oea: getCarrier.oea,
      ctpat: getCarrier.ctpat,
      companyFormationType: getCarrier.companyFormationType,
      companyFormation: getCarrier.companyFormation,
      stepCompleted: getCarrier.stepCompleted,
      verifyByAdmin: getCarrier.verifyByAdmin,
      isBlocked: getCarrier.isBlocked,
    };

    const savedata = await Carrier.create(payload);
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
  createSubCarrier,
};
