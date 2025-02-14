const { handleException } = require("../helper/exception");
const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const allowedFormats = [
  // Excel
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/xls", // .xls (alternative)
  "application/xlsx", // .xlsx (alternative)

  // Text
  "text/plain", // .txt

  // Word Documents
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx

  // Images
  "image/jpeg", // .jpg, .jpeg
  "image/jpg", // .jpg (alternative)
  "image/png", // .png

  // PDFs
  "application/pdf", // .pdf
  "application/x-pdf", // .pdf (alternative)
  "application/acrobat", // .pdf (alternative)
  "applications/vnd.pdf", // .pdf (alternative)
  "text/pdf", // .pdf (alternative)
  "text/x-pdf", // .pdf (alternative)
  "application/octet-stream",
];

const fileFilter = (req, file, cb) => {
  console.log("file.mimetype", file.mimetype);
  if (allowedFormats.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      "Invalid file type. Only .XLS, .XLSX, .TXT, .DOC, .DOCX, .JPG, .PNG, .PDF are allowed."
    );
    handleException(req.logger, req.res, error);
    cb(error, false);
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    key: (req, file, cb) => {
      const filename = `${Date.now()}-${file.originalname}`;
      cb(null, filename);
    },
  }),
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 15 }, // Limit file size to 15MB
});

module.exports = upload;
