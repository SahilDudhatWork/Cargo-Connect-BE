require("dotenv").config();
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION,
});

const generatePresignedUrl = (objectKey) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: objectKey,
    Expires: 3600,
  };

  return s3.getSignedUrl("getObject", params);
};

module.exports = {
  generatePresignedUrl,
};
