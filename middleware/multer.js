const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const { generatePresignedUrl } = require("../utils/generatePresignedUrl");

// AWS S3 Configuration using AWS SDK v3
const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/i;
  console.log("multer", file);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    req.fileValidationError =
      "Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed";
    cb(null, false);
  }
};

// Multer S3 Storage Configuration
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    key: (req, file, cb) => {
      const filename = `${Date.now()}-${file.originalname}`;
      const presignedUrl = generatePresignedUrl(filename);
      file.presignedUrl = presignedUrl;
      cb(null, filename);
    },
  }),
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 15 }, // Limit file size to 15MB
});

module.exports = upload;
