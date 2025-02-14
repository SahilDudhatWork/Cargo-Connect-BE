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
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

const fileFilter = (req, file, cb) => {
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
