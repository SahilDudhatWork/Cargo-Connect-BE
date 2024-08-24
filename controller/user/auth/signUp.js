// const User = require("../../../model/user/user");
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
//  * Register a new user with email and password
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

//     const userEmailExist = await User.findOne({
//       email: email,
//     });
//     if (userEmailExist) {
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
//     await User.create(req.body);

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

////////////////////////////////////////////////////////
////////////////////////////////////////////////////////

const User = require("../../../model/user/user");
const { handleException } = require("../../../helper/exception");
const { encrypt } = require("../../../helper/encrypt-decrypt");
const Response = require("../../../helper/response");
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
    // Extract JSON fields with default values for optional fields
    const {
      companyName,
      contactName,
      contactNumber,
      email,
      password,
      commercialReference,
    } = req.body;

    // Validate email and password if provided
    if (email && password) {
      const { error } = emailAndPasswordVerification({ email, password });
      if (error) {
        return Response.error({
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: error.details[0].message,
        });
      }
    }

    // Check if email already exists
    if (email) {
      const userEmailExist = await User.findOne({ email });
      if (userEmailExist) {
        return Response.error({
          res,
          status: STATUS_CODE.BAD_REQUEST,
          msg: ERROR_MSGS.ACCOUNT_EXISTS,
        });
      }
    }

    // Encrypt password if provided
    const passwordHash = password
      ? encrypt(password, process.env.PASSWORD_ENCRYPTION_KEY)
      : null;

    // Store file paths in the body
    req.body.profilePicture = req.files?.["profilePicture"]
      ? req.files["profilePicture"][0].filename
      : null;
    req.body.companyFormation = {
      usa: {
        w9_Form: req.files?.["companyFormation.usa.w9_Form"]
          ? req.files["companyFormation.usa.w9_Form"][0].filename
          : null,
        utility_Bill: req.files?.["companyFormation.usa.utility_Bill"]
          ? req.files["companyFormation.usa.utility_Bill"][0].filename
          : null,
      },
      maxico: {
        copia_Rfc_Form: req.files?.["companyFormation.maxico.copia_Rfc_Form"]
          ? req.files["companyFormation.maxico.copia_Rfc_Form"][0].filename
          : null,
        constance_Of_Fiscal_Situation: req.files?.[
          "companyFormation.maxico.constance_Of_Fiscal_Situation"
        ]
          ? req.files[
              "companyFormation.maxico.constance_Of_Fiscal_Situation"
            ][0].filename
          : null,
        proof_of_Favorable: req.files?.[
          "companyFormation.maxico.proof_of_Favorable"
        ]
          ? req.files["companyFormation.maxico.proof_of_Favorable"][0].filename
          : null,
        proof_Of_Address: req.files?.[
          "companyFormation.maxico.proof_Of_Address"
        ]
          ? req.files["companyFormation.maxico.proof_Of_Address"][0].filename
          : null,
      },
    };

    // Create a new user
    await User.create({
      accountId: generateAccountId(),
      companyName: companyName || undefined,
      contactName: contactName || undefined,
      contactNumber: contactNumber || undefined,
      email: email || undefined,
      password: passwordHash || undefined,
      commercialReference: commercialReference || undefined,
      profilePicture: req.body.profilePicture || undefined,
      companyFormation: req.body.companyFormation,
    });

    return Response.success({
      res,
      status: STATUS_CODE.CREATED,
      msg: INFO_MSGS.SUCCESSFUL_REGISTER,
    });
  } catch (error) {
    console.log("error--->", error);
    return handleException(logger, res, error);
  }
};

// Export with Multer middleware for file handling
module.exports = {
  signUp: [
    upload.fields([
      { name: "profilePicture", maxCount: 1 },
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
