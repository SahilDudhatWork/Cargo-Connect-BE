const { handleException } = require("../../../../helper/exception");
const Response = require("../../../../helper/response");
const { hendleModel } = require("../../../../utils/hendleModel");
const { encrypt } = require("../../../../helper/encrypt-decrypt");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../../helper/constant");

const update = async (req, res) => {
  const { logger } = req;
  try {
    const { type, id } = req.params;
    const { email, accountId, password } = req.body;

    if (req.fileValidationError) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: req.fileValidationError,
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
      req.body.password = passwordHash;
    }

    req.body.profilePicture = req.files?.profilePicture
      ? req.files["profilePicture"][0].presignedUrl
      : existingData.profilePicture;
    req.body.scac = req.files?.scac
      ? req.files["scac"][0].presignedUrl
      : existingData.scac;
    req.body.caat = req.files?.caat
      ? req.files["caat"][0].presignedUrl
      : existingData.caat;
    req.body.insurancePolicy = req.files?.insurancePolicy
      ? req.files["insurancePolicy"][0].presignedUrl
      : existingData.insurancePolicy;
    req.body.oea = req.files?.oea ? req.files["oea"][0].presignedUrl : null;
    req.body.ctpat = req.files?.ctpat
      ? req.files["ctpat"][0].presignedUrl
      : existingData.oea;

    req.body.companyFormation = {
      usa: {
        w9_Form: req.files?.companyFormation_usa_w9_Form
          ? req.files["companyFormation_usa_w9_Form"][0].presignedUrl
          : existingData.companyFormation.usa.w9_Form,
        utility_Bill: req.files?.companyFormation_usa_utility_Bill
          ? req.files["companyFormation_usa_utility_Bill"][0].presignedUrl
          : existingData.companyFormation.usa.utility_Bill,
      },
      maxico: {
        copia_Rfc_Form: req.files?.companyFormation_maxico_copia_Rfc_Form
          ? req.files["companyFormation_maxico_copia_Rfc_Form"][0].presignedUrl
          : existingData.companyFormation.maxico.copia_Rfc_Form,
        constance_Of_Fiscal_Situation: req.files
          ?.companyFormation_maxico_constance_Of_Fiscal_Situation
          ? req.files[
              "companyFormation_maxico_constance_Of_Fiscal_Situation"
            ][0].presignedUrl
          : existingData.companyFormation.maxico.constance_Of_Fiscal_Situation,
        proof_of_Favorable: req.files
          ?.companyFormation_maxico_proof_of_Favorable
          ? req.files["companyFormation_maxico_proof_of_Favorable"][0]
              .presignedUrl
          : existingData.companyFormation.maxico.proof_of_Favorable,
        proof_Of_Address: req.files?.companyFormation_maxico_proof_Of_Address
          ? req.files["companyFormation_maxico_proof_Of_Address"][0]
              .presignedUrl
          : existingData.companyFormation.maxico.proof_Of_Address,
      },
    };

    const updatedData = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
    });

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
