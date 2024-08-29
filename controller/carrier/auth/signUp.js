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
  const { logger } = req;
  try {
    const {
      companyName,
      contactName,
      contactNumber,
      email,
      password,
      commercialReference,
    } = req.body;

    if (req.fileValidationError) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: req.fileValidationError,
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
    req.body.profilePicture = req.files["profilePicture"]
      ? req.files["profilePicture"][0].filename
      : null;
    req.body.scac = req.files["scac"] ? req.files["scac"][0].filename : null;
    req.body.caat = req.files["caat"] ? req.files["caat"][0].filename : null;
    req.body.insurancePolicy = req.files["insurancePolicy"]
      ? req.files["insurancePolicy"][0].filename
      : null;
    req.body.oea = req.files["oea"] ? req.files["oea"][0].filename : null;
    req.body.ctpat = req.files["ctpat"] ? req.files["ctpat"][0].filename : null;
    req.body.companyFormation = {
      usa: {
        w9_Form: req.files["companyFormation_usa_w9_Form"]
          ? req.files["companyFormation_usa_w9_Form"][0].filename
          : null,
        utility_Bill: req.files["companyFormation_usa_utility_Bill"]
          ? req.files["companyFormation_usa_utility_Bill"][0].filename
          : null,
      },
      maxico: {
        copia_Rfc_Form: req.files["companyFormation_maxico_copia_Rfc_Form"]
          ? req.files["companyFormation_maxico_copia_Rfc_Form"][0].filename
          : null,
        constance_Of_Fiscal_Situation: req.files[
          "companyFormation_maxico_constance_Of_Fiscal_Situation"
        ]
          ? req.files[
              "companyFormation_maxico_constance_Of_Fiscal_Situation"
            ][0].filename
          : null,
        proof_of_Favorable: req.files[
          "companyFormation_maxico_proof_of_Favorable"
        ]
          ? req.files["companyFormation_maxico_proof_of_Favorable"][0].filename
          : null,
        proof_Of_Address: req.files["companyFormation_maxico_proof_Of_Address"]
          ? req.files["companyFormation_maxico_proof_Of_Address"][0].filename
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
      profilePicture: req.body.profilePicture,
      scac: req.body.scac,
      caat: req.body.caat,
      insurancePolicy: req.body.insurancePolicy,
      oea: req.body.oea,
      ctpat: req.body.ctpat,
      companyFormation: req.body.companyFormation,
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
