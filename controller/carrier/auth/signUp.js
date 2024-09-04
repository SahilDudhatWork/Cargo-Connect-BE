const Carrier = require("../../../model/carrier/carrier");
const { handleException } = require("../../../helper/exception");
const { encrypt } = require("../../../helper/encrypt-decrypt");
const Response = require("../../../helper/response");
const jwt = require("jsonwebtoken");
const { generateAccountId } = require("../../../utils/generateUniqueId");
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

    if (fileValidationError) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: fileValidationError,
      });
    }

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
      ? files["profilePicture"][0].presignedUrl
      : null;
    body.scac = files["scac"] ? files["scac"][0].presignedUrl : null;
    body.caat = files["caat"] ? files["caat"][0].presignedUrl : null;
    body.insurancePolicy = files["insurancePolicy"]
      ? files["insurancePolicy"][0].presignedUrl
      : null;
    body.oea = files["oea"] ? files["oea"][0].presignedUrl : null;
    body.ctpat = files["ctpat"] ? files["ctpat"][0].presignedUrl : null;
    body.companyFormation = {
      usa: {
        w9_Form: files["companyFormation_usa_w9_Form"]
          ? files["companyFormation_usa_w9_Form"][0].presignedUrl
          : null,
        utility_Bill: files["companyFormation_usa_utility_Bill"]
          ? files["companyFormation_usa_utility_Bill"][0].presignedUrl
          : null,
      },
      maxico: {
        copia_Rfc_Form: files["companyFormation_maxico_copia_Rfc_Form"]
          ? files["companyFormation_maxico_copia_Rfc_Form"][0].presignedUrl
          : null,
        constance_Of_Fiscal_Situation: files[
          "companyFormation_maxico_constance_Of_Fiscal_Situation"
        ]
          ? files["companyFormation_maxico_constance_Of_Fiscal_Situation"][0]
              .presignedUrl
          : null,
        proof_of_Favorable: files["companyFormation_maxico_proof_of_Favorable"]
          ? files["companyFormation_maxico_proof_of_Favorable"][0].presignedUrl
          : null,
        proof_Of_Address: files["companyFormation_maxico_proof_Of_Address"]
          ? files["companyFormation_maxico_proof_Of_Address"][0].presignedUrl
          : null,
      },
    };

    // Create a new carrier
    const saveData = await Carrier.create({
      accountId: generateAccountId(),
      companyName,
      contactName,
      contactNumber,
      email,
      password: passwordHash,
      commercialReference,
      profilePicture: body.profilePicture,
      scac: body.scac,
      caat: body.caat,
      insurancePolicy: body.insurancePolicy,
      oea: body.oea,
      ctpat: body.ctpat,
      companyFormationType,
      companyFormation: body.companyFormation,
    });

    // Generate JWT Token
    const encryptUser = encrypt(
      saveData._id,
      process.env.CARRIER_ENCRYPTION_KEY
    );
    const accessToken = await commonAuth(encryptUser);

    // Update carrier with token details
    await Carrier.findByIdAndUpdate(
      saveData._id,
      {
        lastLogin: new Date(),
        "token.token": accessToken,
        "token.type": "Access",
        "token.createdAt": new Date(),
      },
      { new: true }
    );

    return Response.success({
      res,
      status: STATUS_CODE.CREATED,
      msg: INFO_MSGS.SUCCESSFUL_REGISTER,
      data: { accessToken },
    });
  } catch (error) {
    console.log("error--->", error);
    return handleException(logger, res, error);
  }
};

/**
 * Common Auth function for 2FA checking and JWT token generation
 */
const commonAuth = async (encryptUser) => {
  try {
    const payload = {
      encryptUser,
      expiresIn: process.env.CARRIER_ACCESS_TIME,
      type: "Access",
      role: "User",
    };
    const accessToken = await generateJWTToken(payload);
    return accessToken;
  } catch (error) {
    console.log("commonAuth Error:", error);
    throw error;
  }
};

/**
 * Generate JWT Token
 */
const generateJWTToken = async (payload) => {
  try {
    const { encryptUser, expiresIn, type, role } = payload;
    const token = jwt.sign(
      { userId: encryptUser, type, role },
      process.env.CARRIER_ACCESS_TOKEN,
      { expiresIn }
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
