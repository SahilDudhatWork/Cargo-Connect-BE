const { STATUS_CODE, ERROR_MSGS, INFO_MSGS } = require("./constant");

const response = {
  statusCode: STATUS_CODE.OK,
  msg: INFO_MSGS.SUCCESS,
  errorMessage: ERROR_MSGS.INTERNAL_SERVER_ERROR,
  success: async function ({ res, status, msg, data, total_count }) {
    if (!data) {
      this.statusCode = STATUS_CODE.NO_CONTENT;
    }
    return res.status(status || this.statusCode).json({
      status: status,
      msg: msg || this.message,
      total_count: total_count,
      data: data,
    });
  },
  error: async function ({ res, status, msg, data, total_count }) {

    return res.status(status || 400).json({
      status: status,
      msg: msg || this.errorMessage,
      data: data,
    });
  },
};

module.exports = response;