// const Carrier = require("../../../model/carrier/carrier");
// const { handleException } = require("../../../helper/exception");
// const { encrypt, decrypt } = require("../../../helper/encrypt-decrypt");
// const Response = require("../../../helper/response");
// const {
//   emailAndPasswordVerification,
// } = require("../../../helper/joi-validation");
// const {
//   STATUS_CODE,
//   ERROR_MSGS,
//   INFO_MSGS,
// } = require("../../../helper/constant");
// const { generateAccountId } = require("../../../utils/generateUniqueId");

// /**
//  * Register a new carrier with email and password
//  */
// const signUp = async (req, res) => {
//   const { logger } = req;
//   try {
//     const { email, password } = req.body;

//     const { error } = emailAndPasswordVerification({
//       email,
//       password,
//     });
//     if (error) {
//       const obj = {
//         res,
//         status: STATUS_CODE.BAD_REQUEST,
//         msg: error.details[0].message,
//       };
//       return Response.error(obj);
//     }

//     const carrierEmailExist = await Carrier.findOne({
//       email: email,
//     });
//     if (carrierEmailExist) {
//       const obj = {
//         res,
//         status: STATUS_CODE.BAD_REQUEST,
//         msg: ERROR_MSGS.ACCOUNT_EXISTS,
//       };
//       return Response.error(obj);
//     }

//     const passwordHash = encrypt(password, process.env.PASSWORD_ENCRYPTION_KEY);

//     req.body.accountId = generateAccountId();
//     req.body.password = passwordHash;
//     await Carrier.create(req.body);

//     const obj = {
//       res,
//       status: STATUS_CODE.CREATED,
//       msg: INFO_MSGS.SUCCESSFUL_REGISTER,
//     };
//     return Response.success(obj);
//   } catch (error) {
//     console.log("error--->", error);
//     return handleException(logger, res, error);
//   }
// };

// module.exports = {
//   signUp,
// };

///////////////////////////////////////////////////
///////////////////////////////////////////////////

const Carrier = require("../../../model/carrier/carrier");
const { handleException } = require("../../../helper/exception");
const { encrypt } = require("../../../helper/encrypt-decrypt");
const Response = require("../../../helper/response");
const jwt = require("jsonwebtoken");
const {
  emailAndPasswordVerification,
} = require("../../../helper/joi-validation");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { generateAccountId } = require("../../../utils/generateUniqueId");
const multer = require("multer");
const path = require("path");

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save to 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Combine the signUp logic with file handling
const signUp = async (req, res) => {
  const { logger } = req;
  try {
    // Extract JSON fields
    const {
      companyName,
      contactName,
      contactNumber,
      email,
      password,
      commercialReference,
    } = req.body;

    // Validate email and password
    const { error } = emailAndPasswordVerification({ email, password });
    if (error) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: error.details[0].message,
      });
    }

    // Check if email already exists
    const carrierEmailExist = await Carrier.findOne({ email });
    if (carrierEmailExist) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: ERROR_MSGS.ACCOUNT_EXISTS,
      });
    }

    // Encrypt password
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
        w9_Form: req.files["companyFormation.usa.w9_Form"]
          ? req.files["companyFormation.usa.w9_Form"][0].filename
          : null,
        utility_Bill: req.files["companyFormation.usa.utility_Bill"]
          ? req.files["companyFormation.usa.utility_Bill"][0].filename
          : null,
      },
      maxico: {
        copia_Rfc_Form: req.files["companyFormation.maxico.copia_Rfc_Form"]
          ? req.files["companyFormation.maxico.copia_Rfc_Form"][0].filename
          : null,
        constance_Of_Fiscal_Situation: req.files[
          "companyFormation.maxico.constance_Of_Fiscal_Situation"
        ]
          ? req.files[
              "companyFormation.maxico.constance_Of_Fiscal_Situation"
            ][0].filename
          : null,
        proof_of_Favorable: req.files[
          "companyFormation.maxico.proof_of_Favorable"
        ]
          ? req.files["companyFormation.maxico.proof_of_Favorable"][0].filename
          : null,
        proof_Of_Address: req.files["companyFormation.maxico.proof_Of_Address"]
          ? req.files["companyFormation.maxico.proof_Of_Address"][0].filename
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

    const encryptUser = encrypt(saveData._id, process.env.USER_ENCRYPTION_KEY);
    const accessToken = await commonAuth(encryptUser);

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
const commonAuth = (encryptUser) =>
  new Promise(async (resolve, reject) => {
    try {
      const payload = {
        expiresIn: process.env.USER_ACCESS_TIME,
        encryptUser,
        type: "Access",
        role: "User",
      };
      const accessToken = await generateJWTToken(payload);

      resolve(accessToken);
    } catch (error) {
      console.log("common Auth Log :", error);
      reject(error);
    }
  });
/**
 * Generate JWT Token
 */
const generateJWTToken = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { encryptUser, expiresIn, type, role } = payload;
      const token = jwt.sign(
        { userId: encryptUser, type, role },
        process.env.USER_ACCESS_TOKEN,
        { expiresIn }
      );
      resolve(token);
    } catch (error) {
      reject(error.message);
    }
  });
};

// Export with Multer middleware for file handling
module.exports = {
  signUp: [
    upload.fields([
      { name: "profilePicture", maxCount: 1 },
      { name: "scac", maxCount: 1 },
      { name: "caat", maxCount: 1 },
      { name: "insurancePolicy", maxCount: 1 },
      { name: "oea", maxCount: 1 },
      { name: "ctpat", maxCount: 1 },
      { name: "companyFormation.usa.w9_Form", maxCount: 1 },
      { name: "companyFormation.usa.utility_Bill", maxCount: 1 },
      { name: "companyFormation.maxico.copia_Rfc_Form", maxCount: 1 },
      {
        name: "companyFormation.maxico.constance_Of_Fiscal_Situation",
        maxCount: 1,
      },
      { name: "companyFormation.maxico.proof_of_Favorable", maxCount: 1 },
      { name: "companyFormation.maxico.proof_Of_Address", maxCount: 1 },
    ]),
    signUp,
  ],
};
