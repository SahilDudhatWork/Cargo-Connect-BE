const { STATUS_CODE, ERROR_MSGS } = require("./constant");
const Response = require("./response");

const handleException = async (req, res, error) => {
  if (error.name === "ValidationError") {
    const validationErrors = Object.values(error.errors);
    const errorMessage = validationErrors.map((e) => e.message).join(", ");

    const obj = {
      req,
      res,
      status: STATUS_CODE.BAD_REQUEST,
      msg: errorMessage,
    };

    return Response.error(obj);
  }

  const obj = {
    req,
    res,
    stack: `${error.stack || null}`,
    status: STATUS_CODE.INTERNAL_SERVER_ERROR,
    msg: error.message || ERROR_MSGS.INTERNAL_SERVER_ERROR,
  };
  return Response.error(obj);
};

module.exports = { handleException };
