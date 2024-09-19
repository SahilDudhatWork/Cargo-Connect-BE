const { handleException } = require("../../../../helper/exception");
const Response = require("../../../../helper/response");
const { encrypt } = require("../../../../helper/encrypt-decrypt");
const upload = require("../../../../middleware/multer");
const { hendleModel } = require("../../../../utils/hendleModel");
const {
  generateAccountId,
  generateNumOrCharId,
} = require("../../../../utils/generateUniqueId");
const {
  validateCarrierData,
  validateUserData,
} = require("../../../../utils/validateRegistrationStep");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../../helper/constant");

// Middleware for handling file uploads
const uploadMiddleware = upload.fields([
  { name: "scac", maxCount: 1 },
  { name: "caat", maxCount: 1 },
  { name: "insurancePolicy", maxCount: 1 },
  { name: "oea", maxCount: 1 },
  { name: "ctpat", maxCount: 1 },
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

const create = async (req, res) => {
  const { logger, body, params, files, fileValidationError } = req;
  try {
    const { email, password, companyFormationType, commercialReference } = body;
    let newCommercialReference;
    const { type } = params;

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
        accountId: generateNumOrCharId(),
      }));
    }
    body.commercialReference = newCommercialReference ?? [];

    // Validate company formation fields based on the type
    const usaFields = [
      files["companyFormation_usa_w9_Form"],
      files["companyFormation_usa_utility_Bill"],
    ];

    const maxicoFields = [
      files["companyFormation_maxico_copia_Rfc_Form"],
      files["companyFormation_maxico_constance_Of_Fiscal_Situation"],
      files["companyFormation_maxico_proof_of_Favorable"],
      files["companyFormation_maxico_proof_Of_Address"],
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

    // If companyFormationType is "MEXICO", ensure no USA fields are provided
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

    const Model = await hendleModel(res, type);
    const checkEmailExist = await Model.findOne({
      email: email,
    });
    if (checkEmailExist) {
      const obj = {
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.EMAIL_EXIST,
      };
      return Response.error(obj);
    }

    const passwordHash = encrypt(password, process.env.PASSWORD_ENCRYPTION_KEY);

    body.password = passwordHash;
    body.accountId = generateAccountId();
    body.profilePicture = files["profilePicture"]
      ? files["profilePicture"][0].location
      : null;
    body.scac = files["scac"] ? files["scac"][0].location : null;
    body.caat = files["caat"] ? files["caat"][0].location : null;
    body.insurancePolicy = files["insurancePolicy"]
      ? files["insurancePolicy"][0].location
      : null;
    body.oea = files["oea"] ? files["oea"][0].location : null;
    body.ctpat = files["ctpat"] ? files["ctpat"][0].location : null;

    if (companyFormationType === "MEXICO") {
      body.companyFormation = {
        maxico: {
          copia_Rfc_Form: files["companyFormation_maxico_copia_Rfc_Form"]
            ? files["companyFormation_maxico_copia_Rfc_Form"][0].location
            : null,
          constance_Of_Fiscal_Situation: files[
            "companyFormation_maxico_constance_Of_Fiscal_Situation"
          ]
            ? files["companyFormation_maxico_constance_Of_Fiscal_Situation"][0]
                .location
            : null,
          proof_of_Favorable: files[
            "companyFormation_maxico_proof_of_Favorable"
          ]
            ? files["companyFormation_maxico_proof_of_Favorable"][0].location
            : null,
          proof_Of_Address: files["companyFormation_maxico_proof_Of_Address"]
            ? files["companyFormation_maxico_proof_Of_Address"][0].location
            : null,
        },
      };
    } else if (companyFormationType === "USA") {
      body.companyFormation = {
        usa: {
          w9_Form: files["companyFormation_usa_w9_Form"]
            ? files["companyFormation_usa_w9_Form"][0].location
            : null,
          utility_Bill: files["companyFormation_usa_utility_Bill"]
            ? files["companyFormation_usa_utility_Bill"][0].location
            : null,
        },
      };
    }

    if (type === "user") {
      body.stepCompleted = validateUserData(body);
    } else if (type === "carrier") {
      body.stepCompleted = validateCarrierData(body);
    }

    let saveData = await Model.create(body);

    const statusCode = saveData ? STATUS_CODE.CREATED : STATUS_CODE.BAD_REQUEST;
    const message = saveData
      ? INFO_MSGS.CREATED_SUCCESSFULLY
      : ERROR_MSGS.CREATE_ERR;

    return Response[statusCode === STATUS_CODE.OK ? "success" : "error"]({
      req,
      res,
      status: statusCode,
      msg: message,
      data: saveData || null,
    });
  } catch (error) {
    console.error("error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  uploadMiddleware,
  create,
};
