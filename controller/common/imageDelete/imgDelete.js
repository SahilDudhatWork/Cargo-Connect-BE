const Response = require("../../../helper/response");
const { handleException } = require("../../../helper/exception");
const { hendleModel } = require("../../../utils/hendleModel");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const findAndReplaceFilenameInObject = (obj, filename) => {
  let replaced = false;

  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      replaced = findAndReplaceFilenameInObject(obj[key], filename) || replaced;
    } else if (typeof obj[key] === "string" && obj[key] === filename) {
      obj[key] = null;
      replaced = true;
    }
  }

  return replaced;
};

const imgDelete = async (req, res) => {
  const { logger, body } = req;
  try {
    const { filename, collection, _id } = body;

    const Model = await hendleModel(collection);
    const getData = await Model.findById(_id);

    if (!getData) {
      return Response.error({
        res,
        status: STATUS_CODE.NOT_FOUND,
        msg: ERROR_MSGS.DATA_NOT_FOUND,
      });
    }

    const dataObject = getData.toObject();
    const isReplaced = findAndReplaceFilenameInObject(dataObject, filename);

    if (!isReplaced) {
      return Response.error({
        res,
        status: STATUS_CODE.NOT_FOUND,
        msg: `Filename ${filename} not found in the document`,
      });
    }

    const key = filename.split("/").pop();

    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    const response = await s3.send(command);

    if (response && response.$metadata.httpStatusCode === 204) {
      await Model.updateOne({ _id }, dataObject);

      return Response.success({
        res,
        status: STATUS_CODE.OK,
        msg: `File ${filename} deleted successfully from S3 and replaced in the document`,
      });
    } else {
      return Response.error({
        res,
        status: STATUS_CODE.INTERNAL_SERVER_ERROR,
        msg: "Failed to delete the file from S3",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  imgDelete,
};
