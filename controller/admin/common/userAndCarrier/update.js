const Reference = require("../../../../model/common/reference");
const { handleException } = require("../../../../helper/exception");
const Response = require("../../../../helper/response");
const { hendleModel } = require("../../../../utils/hendleModel");
const { encrypt, decrypt } = require("../../../../helper/encrypt-decrypt");
const { findOne } = require("../../../../utils/helper");
const { ObjectId } = require("mongoose").Types;
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
    const {
      email,
      accountId,
      password,
      companyFormationType,
      commercialReference,
    } = body;
    const actId = parseInt(id);

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
    if (companyFormationType === "MEXICO") {
      const hasUsaFields = usaFields.some((field) => field !== undefined);
      if (hasUsaFields) {
        return Response.error({
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: "Maxico company formation selected, but USA fields are provided.",
        });
      }
    }

    const Model = await hendleModel(type);
    const existingData = await findOne(actId, Model);

    if (!existingData) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.DATA_NOT_AVAILABLE,
      });
    }

    const emailInUse = await Model.findOne({ email });

    if (emailInUse && emailInUse.accountId !== actId) {
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
      ? files["profilePicture"][0].location
      : existingData.profilePicture;
    body.scac = files?.scac ? files["scac"][0].location : existingData.scac;
    body.caat = files?.caat ? files["caat"][0].location : existingData.caat;
    body.insurancePolicy = files?.insurancePolicy
      ? files["insurancePolicy"][0].location
      : existingData.insurancePolicy;
    body.oea = files?.oea ? files["oea"][0].location : null;
    body.ctpat = files?.ctpat ? files["ctpat"][0].location : existingData.oea;

    if (companyFormationType === "USA") {
      body.companyFormation = {
        usa: {
          w9_Form: files?.companyFormation_usa_w9_Form
            ? files["companyFormation_usa_w9_Form"][0].location
            : existingData?.companyFormation.usa.w9_Form,
          utility_Bill: files?.companyFormation_usa_utility_Bill
            ? files["companyFormation_usa_utility_Bill"][0].location
            : existingData?.companyFormation.usa.utility_Bill,
        },
        maxico: {
          copia_Rfc_Form: null,
          constance_Of_Fiscal_Situation: null,
          proof_of_Favorable: null,
          proof_Of_Address: null,
        },
      };
    } else if (companyFormationType === "MEXICO") {
      body.companyFormation = {
        maxico: {
          copia_Rfc_Form: files?.companyFormation_maxico_copia_Rfc_Form
            ? files["companyFormation_maxico_copia_Rfc_Form"][0].location
            : existingData?.companyFormation.maxico.copia_Rfc_Form,
          constance_Of_Fiscal_Situation:
            files?.companyFormation_maxico_constance_Of_Fiscal_Situation
              ? files[
                  "companyFormation_maxico_constance_Of_Fiscal_Situation"
                ][0].location
              : existingData?.companyFormation.maxico
                  .constance_Of_Fiscal_Situation,
          proof_of_Favorable: files?.companyFormation_maxico_proof_of_Favorable
            ? files["companyFormation_maxico_proof_of_Favorable"][0].location
            : existingData?.companyFormation.maxico.proof_of_Favorable,
          proof_Of_Address: files?.companyFormation_maxico_proof_Of_Address
            ? files["companyFormation_maxico_proof_Of_Address"][0].location
            : existingData?.companyFormation.maxico.proof_Of_Address,
        },
        usa: {
          w9_Form: null,
          utility_Bill: null,
        },
      };
    }

    if (Array.isArray(commercialReference) && commercialReference.length > 0) {
      for (const reference of commercialReference) {
        if (reference._id) {
          await Reference.findByIdAndUpdate(reference._id, reference, {
            new: true,
          });
        } else {
          reference.clientRelationId = existingData._id;
          reference.type = type.replace(/\b\w/g, (char) => char.toUpperCase());

          const check2Exist = await Reference.find({
            clientRelationId: existingData._id,
            type: reference.type,
          });
          if (check2Exist.length >= 2) {
            return Response.error({
              res,
              status: STATUS_CODE.BAD_REQUEST,
              msg: ERROR_MSGS.REFERENCE_LIMIT,
            });
          } else {
            await Reference.create(reference);
          }
        }
      }
    }

    const updatedData = await Model.findOneAndUpdate(
      { accountId: actId },
      body,
      {
        new: true,
      }
    );

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
    delete result.forgotPassword;

    const decryptPassword = decrypt(
      result.password,
      process.env.PASSWORD_ENCRYPTION_KEY
    );
    result.password = decryptPassword;

    const getReference = await Reference.find({
      clientRelationId: new ObjectId(existingData._id),
    });
    result.commercialReference = getReference;

    return Response.success({
      req,
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.UPDATED_SUCCESSFULLY,
      data: result,
    });
  } catch (error) {
    console.error("Error :", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  update,
};
