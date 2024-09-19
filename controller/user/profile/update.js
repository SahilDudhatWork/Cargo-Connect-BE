const User = require("../../../model/user/user");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { handleException } = require("../../../helper/exception");
const { validateUserData } = require("../../../utils/validateRegistrationStep");
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
  const { logger, userId, body, files, fileValidationError } = req;
  try {
    const {
      email,
      password,
      accountId,
      companyFormationType,
      commercialReference,
    } = body;
    let newCommercialReference;

    if (fileValidationError) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: fileValidationError,
      });
    }

    if (Array.isArray(commercialReference) && commercialReference.length > 0) {
      newCommercialReference = commercialReference.map((i) => ({
        ...i,
      }));
    }
    body.commercialReference = newCommercialReference ?? [];

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
    if (fetchUser && !fetchUser?._id.equals(userId)) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.EMAIL_EXIST,
      });
    }

    // Validate USA and Maxico fields based on the companyFormationType
    const usaFields = [
      files?.companyFormation_usa_w9_Form,
      files?.companyFormation_usa_utility_Bill,
    ];

    const maxicoFields = [
      files?.companyFormation_maxico_copia_Rfc_Form,
      files?.companyFormation_maxico_constance_Of_Fiscal_Situation,
      files?.companyFormation_maxico_proof_of_Favorable,
      files?.companyFormation_maxico_proof_Of_Address,
    ];

    // If companyFormationType is "USA", ensure no Maxico fields are provided
    if (companyFormationType === "USA") {
      const hasMaxicoFields = maxicoFields.some((field) => field !== undefined);
      if (hasMaxicoFields) {
        return Response.error({
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: "USA company formation selected, but Maxico fields are provided.",
        });
      }
    }

    // If companyFormationType is "maxico", ensure no USA fields are provided
    if (companyFormationType === "MAXICO") {
      const hasUsaFields = usaFields.some((field) => field !== undefined);
      if (hasUsaFields) {
        return Response.error({
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: "Maxico company formation selected, but USA fields are provided.",
        });
      }
    }

    // Store the profile picture and company formation documents
    body.profilePicture = files?.profilePicture
      ? files["profilePicture"][0].location
      : fetchUser?.profilePicture;

    if (companyFormationType === "USA") {
      body.companyFormation = {
        usa: {
          w9_Form: files?.companyFormation_usa_w9_Form
            ? files["companyFormation_usa_w9_Form"][0].location
            : fetchUser?.companyFormation.usa.w9_Form,
          utility_Bill: files?.companyFormation_usa_utility_Bill
            ? files["companyFormation_usa_utility_Bill"][0].location
            : fetchUser?.companyFormation.usa.utility_Bill,
        },
        maxico: {
          copia_Rfc_Form: null,
          constance_Of_Fiscal_Situation: null,
          proof_of_Favorable: null,
          proof_Of_Address: null,
        },
      };
    } else if (companyFormationType === "MAXICO") {
      body.companyFormation = {
        maxico: {
          copia_Rfc_Form: files?.companyFormation_maxico_copia_Rfc_Form
            ? files["companyFormation_maxico_copia_Rfc_Form"][0].location
            : fetchUser?.companyFormation.maxico.copia_Rfc_Form,
          constance_Of_Fiscal_Situation:
            files?.companyFormation_maxico_constance_Of_Fiscal_Situation
              ? files[
                  "companyFormation_maxico_constance_Of_Fiscal_Situation"
                ][0].location
              : fetchUser?.companyFormation.maxico
                  .constance_Of_Fiscal_Situation,
          proof_of_Favorable: files?.companyFormation_maxico_proof_of_Favorable
            ? files["companyFormation_maxico_proof_of_Favorable"][0]
                .location
            : fetchUser?.companyFormation.maxico.proof_of_Favorable,
          proof_Of_Address: files?.companyFormation_maxico_proof_Of_Address
            ? files["companyFormation_maxico_proof_Of_Address"][0].location
            : fetchUser?.companyFormation.maxico.proof_Of_Address,
        },
        usa: {
          w9_Form: null,
          utility_Bill: null,
        },
      };
    }

    // Update the user's data in the database
    const updateData = await User.findByIdAndUpdate(
      { _id: new ObjectId(userId) },
      body,
      { new: true }
    );

    updateData.stepCompleted = validateUserData(updateData);
    updateData.save();

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
