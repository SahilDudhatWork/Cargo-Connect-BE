const User = require("../../../model/user/user");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { handleException } = require("../../../helper/exception");
const Response = require("../../../helper/response");
const { ObjectId } = require("mongoose").Types;
const upload = require("../../../middleware/multer");

// Middleware for handling file uploads
const uploadMiddleware = upload.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "companyFormation_usa_w9_Form", maxCount: 1 },
  { name: "companyFormation_usa_utility_Bill", maxCount: 1 },
  { name: "companyFormation_maxico_copia_Rfc_Form", maxCount: 1 },
  {
    name: "companyFormation_maxico_constance_Of_Fiscal_Situation",
    maxCount: 1,
  },
  { name: "companyFormation_maxico_proof_of_Favorable", maxCount: 1 },
  { name: "companyFormation_maxico_proof_Of_Address", maxCount: 1 },
]);

const update = async (req, res) => {
  const { logger, userId } = req;
  try {
    const { email, password, accountId } = req.body;

    if (req.fileValidationError) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: req.fileValidationError,
      });
    }

    if (accountId || password) {
      const errorMsg = accountId
        ? `AccountId ${ERROR_MSGS.NOT_EDITABLE}`
        : `Password ${ERROR_MSGS.NOT_EDITABLE}`;
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: errorMsg,
      });
    }

    const fetchUser = await User.findOne({ email });
    if (fetchUser && !fetchUser._id.equals(userId)) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.EMAIL_EXIST,
      });
    }

    req.body.profilePicture = req.files?.profilePicture
      ? req.files["profilePicture"][0].presignedUrl
      : fetchUser.profilePicture;

    req.body.companyFormation = {
      usa: {
        w9_Form: req.files?.companyFormation_usa_w9_Form
          ? req.files["companyFormation_usa_w9_Form"][0].presignedUrl
          : fetchUser.companyFormation.usa.w9_Form,
        utility_Bill: req.files?.companyFormation_usa_utility_Bill
          ? req.files["companyFormation_usa_utility_Bill"][0].presignedUrl
          : fetchUser.companyFormation.usa.utility_Bill,
      },
      maxico: {
        copia_Rfc_Form: req.files?.companyFormation_maxico_copia_Rfc_Form
          ? req.files["companyFormation_maxico_copia_Rfc_Form"][0].presignedUrl
          : fetchUser.companyFormation.maxico.copia_Rfc_Form,
        constance_Of_Fiscal_Situation: req.files
          ?.companyFormation_maxico_constance_Of_Fiscal_Situation
          ? req.files[
              "companyFormation_maxico_constance_Of_Fiscal_Situation"
            ][0].presignedUrl
          : fetchUser.companyFormation.maxico.constance_Of_Fiscal_Situation,
        proof_of_Favorable: req.files
          ?.companyFormation_maxico_proof_of_Favorable
          ? req.files["companyFormation_maxico_proof_of_Favorable"][0]
              .presignedUrl
          : fetchUser.companyFormation.maxico.proof_of_Favorable,
        proof_Of_Address: req.files?.companyFormation_maxico_proof_Of_Address
          ? req.files["companyFormation_maxico_proof_Of_Address"][0]
              .presignedUrl
          : fetchUser.companyFormation.maxico.proof_Of_Address,
      },
    };

    const updateData = await User.findByIdAndUpdate(
      { _id: new ObjectId(userId) },
      req.body,
      { new: true }
    );

    const result = updateData.toObject();
    delete result.password;
    delete result.token;
    delete result.forgotPassword;

    const statusCode = updateData ? STATUS_CODE.OK : STATUS_CODE.BAD_REQUEST;
    const message = updateData
      ? INFO_MSGS.UPDATED_SUCCESSFULLY
      : ERROR_MSGS.UPDATE_ERR;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: result,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  uploadMiddleware,
  update,
};
