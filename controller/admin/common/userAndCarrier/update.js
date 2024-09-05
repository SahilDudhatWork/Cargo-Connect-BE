const { handleException } = require("../../../../helper/exception");
const Response = require("../../../../helper/response");
const { hendleModel } = require("../../../../utils/hendleModel");
const { encrypt } = require("../../../../helper/encrypt-decrypt");
const {
  validateCarrierData,
  validateUserData,
} = require("../../../../utils/validateRegistrationStep");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../../helper/constant");

const update = async (req, res) => {
  const { logger, params, body, files, fileValidationError } = req;
  try {
    const { type, id } = params;
    const { email, accountId, password } = body;

    if (fileValidationError) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: fileValidationError,
      });
    }

    if (accountId) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: `AccountId ${ERROR_MSGS.NOT_EDITABLE}`,
      });
    }
    const Model = await hendleModel(res, type);

    const existingData = await Model.findById(id);
    if (!existingData) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.DATA_NOT_AVAILABLE,
      });
    }

    const emailInUse = await Model.findOne({ email });
    if (emailInUse && !emailInUse._id.equals(id)) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.EMAIL_EXIST,
      });
    }

    if (password) {
      const passwordHash = encrypt(
        password,
        process.env.PASSWORD_ENCRYPTION_KEY
      );
      body.password = passwordHash;
    }

    body.profilePicture = files?.profilePicture
      ? files["profilePicture"][0].presignedUrl
      : existingData.profilePicture;
    body.scac = files?.scac ? files["scac"][0].presignedUrl : existingData.scac;
    body.caat = files?.caat ? files["caat"][0].presignedUrl : existingData.caat;
    body.insurancePolicy = files?.insurancePolicy
      ? files["insurancePolicy"][0].presignedUrl
      : existingData.insurancePolicy;
    body.oea = files?.oea ? files["oea"][0].presignedUrl : null;
    body.ctpat = files?.ctpat
      ? files["ctpat"][0].presignedUrl
      : existingData.oea;

    body.companyFormation = {
      usa: {
        w9_Form: files?.companyFormation_usa_w9_Form
          ? files["companyFormation_usa_w9_Form"][0].presignedUrl
          : existingData.companyFormation.usa.w9_Form,
        utility_Bill: files?.companyFormation_usa_utility_Bill
          ? files["companyFormation_usa_utility_Bill"][0].presignedUrl
          : existingData.companyFormation.usa.utility_Bill,
      },
      maxico: {
        copia_Rfc_Form: files?.companyFormation_maxico_copia_Rfc_Form
          ? files["companyFormation_maxico_copia_Rfc_Form"][0].presignedUrl
          : existingData.companyFormation.maxico.copia_Rfc_Form,
        constance_Of_Fiscal_Situation:
          files?.companyFormation_maxico_constance_Of_Fiscal_Situation
            ? files["companyFormation_maxico_constance_Of_Fiscal_Situation"][0]
                .presignedUrl
            : existingData.companyFormation.maxico
                .constance_Of_Fiscal_Situation,
        proof_of_Favorable: files?.companyFormation_maxico_proof_of_Favorable
          ? files["companyFormation_maxico_proof_of_Favorable"][0].presignedUrl
          : existingData.companyFormation.maxico.proof_of_Favorable,
        proof_Of_Address: files?.companyFormation_maxico_proof_Of_Address
          ? files["companyFormation_maxico_proof_Of_Address"][0].presignedUrl
          : existingData.companyFormation.maxico.proof_Of_Address,
      },
    };

    const updatedData = await Model.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (type === "user") {
      updatedData.stepCompleted = validateUserData(updatedData);
      updatedData.save();
    } else if (type === "carrier") {
      updatedData.stepCompleted = validateCarrierData(updatedData);
      updatedData.save();
    }

    if (!updatedData) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.UPDATE_ERR,
      });
    }
    const result = updatedData.toObject();
    delete result.token;

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.UPDATED_SUCCESSFULLY,
      data: updatedData,
    });
  } catch (error) {
    console.error("Error :", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  update,
};
