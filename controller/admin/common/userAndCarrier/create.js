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
  const { logger, body, params, files, fileValidationError } = req;
  try {
    const { email, password } = body;
    const { type } = params;

    if (fileValidationError) {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: fileValidationError,
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

    body.password = passwordHash;
    body.accountId = generateAccountId();
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
