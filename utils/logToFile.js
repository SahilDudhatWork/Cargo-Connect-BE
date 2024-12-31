const Logger = require("../model/common/logger");

const logToFile = async (logType, originalUrl, status, message) => {
  await Logger.create({
    originalUrl,
    logType,
    status,
    message,
  });
};

module.exports = logToFile;
