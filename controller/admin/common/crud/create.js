const { handleException } = require("../../../../helper/exception");
const Response = require("../../../../helper/response");
const { encrypt } = require("../../../../helper/encrypt-decrypt");
const upload = require("../../../../middleware/multer");
const { hendleModel } = require("../../../../utils/hendleModel");
const { generateAccountId } = require("../../../../utils/generateUniqueId");
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
  const { logger } = req;
  try {
    const { email, password } = req.body;
    const { type } = req.params;

    if (req.fileValidationError) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: req.fileValidationError,
      });
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

    req.body.password = passwordHash;
    req.body.accountId = generateAccountId();
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

    let saveData = await Model.create(req.body);

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
