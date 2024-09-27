const Carrier = require("../../../model/carrier/carrier");
const Reference = require("../../../model/common/reference");
const { handleException } = require("../../../helper/exception");
const { encrypt } = require("../../../helper/encrypt-decrypt");
const Response = require("../../../helper/response");
const jwt = require("jsonwebtoken");
const { signUpSchemaValidate } = require("../../../helper/joi-validation");
const {
  generateAccountId,
  generateNumOrCharId,
} = require("../../../utils/generateUniqueId");
const {
  validateCarrierData,
} = require("../../../utils/validateRegistrationStep");
const upload = require("../../../middleware/multer");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

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

const signUp = async (req, res) => {
  const { logger, body, files, fileValidationError } = req;
  try {
    const {
      companyName,
      contactName,
      contactNumber,
      email,
      password,
      commercialReference,
      companyFormationType,
    } = body;

    const { error } = signUpSchemaValidate({
      companyName,
      contactName,
      contactNumber,
      email,
      password,
      commercialReference,
      companyFormationType,
    });

    if (error) {
      const firstErrorMessage = error.details[0].message;
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: firstErrorMessage,
      });
    }

    if (fileValidationError) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: fileValidationError,
      });
    }

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

    // Check if the email already exists
    const carrierEmailExist = await Carrier.findOne({ email });
    if (carrierEmailExist) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_EXISTS,
      });
    }

    const passwordHash = encrypt(password, process.env.PASSWORD_ENCRYPTION_KEY);

    // Store file paths in the body
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
      const hasUsaFields = usaFields.some((field) => field !== undefined);
      if (hasUsaFields) {
        return Response.error({
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: "Maxico company formation selected, but USA fields are provided.",
        });
      }

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
      const requiredFields = [
        {
          field: "copia_Rfc_Form",
          label: "companyFormation.maxico.copia_Rfc_Form",
        },
        {
          field: "constance_Of_Fiscal_Situation",
          label: "companyFormation.maxico.constance_Of_Fiscal_Situation",
        },
        {
          field: "proof_of_Favorable",
          label: "companyFormation.maxico.proof_of_Favorable",
        },
        {
          field: "proof_Of_Address",
          label: "companyFormation.maxico.proof_Of_Address",
        },
      ];

      for (const { field, label } of requiredFields) {
        if (!body.companyFormation.maxico[field]) {
          const message = `${label} ${ERROR_MSGS.KEY_REQUIRED}`;
          return Response.error({
            res,
            status: STATUS_CODE.BAD_REQUEST,
            msg: message,
          });
        }
      }
    } else if (companyFormationType === "USA") {
      const hasMaxicoFields = maxicoFields.some((field) => field !== undefined);
      if (hasMaxicoFields) {
        return Response.error({
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: "USA company formation selected, but Maxico fields are provided.",
        });
      }

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

      const requiredFields = [
        { field: "w9_Form", label: "companyFormation.usa.w9_Form" },
        { field: "utility_Bill", label: "companyFormation.usa.utility_Bill" },
      ];

      for (const { field, label } of requiredFields) {
        if (!body.companyFormation.usa[field]) {
          const message = `${label} ${ERROR_MSGS.KEY_REQUIRED}`;
          return Response.error({
            res,
            status: STATUS_CODE.BAD_REQUEST,
            msg: message,
          });
        }
      }
    }

    // Create a new carrier
    const saveData = await Carrier.create({
      accountId: generateAccountId(),
      companyName,
      contactName,
      contactNumber,
      email,
      password: passwordHash,
      profilePicture: body.profilePicture,
      scac: body.scac,
      caat: body.caat,
      insurancePolicy: body.insurancePolicy,
      oea: body.oea,
      ctpat: body.ctpat,
      companyFormationType,
      companyFormation: body.companyFormation,
      stepCompleted: validateCarrierData(body),
    });

    if (Array.isArray(commercialReference) && commercialReference.length > 0) {
      const commercialReferencesToInsert = commercialReference.map(
        (reference) => {
          return {
            ...reference,
            clientRelationId: saveData._id,
            type: "Carrier",
          };
        }
      );
      await Reference.insertMany(commercialReferencesToInsert);
    }

    // Generate JWT Token
    const encryptCarrier = encrypt(
      saveData._id,
      process.env.CARRIER_ENCRYPTION_KEY
    );
    const accessToken = await commonAuth(
      encryptCarrier,
      process.env.CARRIER_ACCESS_TIME,
      process.env.CARRIER_ACCESS_TOKEN,
      "Access"
    );
    const refreshToken = await commonAuth(
      encryptCarrier,
      process.env.REFRESH_TOKEN_TIME,
      process.env.REFRESH_ACCESS_TOKEN,
      "Refresh"
    );

    // Update carrier with token details
    await Carrier.findByIdAndUpdate(
      saveData._id,
      {
        lastLogin: new Date(),
        "token.accessToken": accessToken,
        "token.refreshToken": refreshToken,
        "token.type": "Access",
        "token.createdAt": new Date(),
      },
      { new: true }
    );

    return Response.success({
      res,
      status: STATUS_CODE.CREATED,
      msg: INFO_MSGS.SUCCESSFUL_REGISTER,
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    console.log("error--->", error);
    return handleException(logger, res, error);
  }
};

// Common Auth function for 2FA checking and JWT token generation
const commonAuth = async (encryptCarrier, ACCESS_TIME, ACCESS_TOKEN, type) => {
  try {
    const payload = {
      encryptCarrier,
      expiresIn: ACCESS_TIME,
      accessToken: ACCESS_TOKEN,
      type,
      role: "Carrier",
    };
    const accessToken = await generateJWTToken(payload);
    return accessToken;
  } catch (error) {
    console.log("commonAuth Error:", error);
    throw error;
  }
};

// Generate JWT Token
const generateJWTToken = async (payload) => {
  try {
    const { encryptCarrier, expiresIn, accessToken, type, role } = payload;
    const token = jwt.sign(
      { carrierId: encryptCarrier, type, role },
      accessToken,
      {
        expiresIn,
      }
    );
    return token;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  uploadMiddleware,
  signUp,
};
