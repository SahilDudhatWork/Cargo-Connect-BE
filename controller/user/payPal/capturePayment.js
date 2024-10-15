const paypal = require("@paypal/checkout-server-sdk");
const Response = require("../../../helper/response");
const { handleException } = require("../../../helper/exception");
const {
  STATUS_CODE,
  ERROR_MSGS,
  INFO_MSGS,
} = require("../../../helper/constant");
const { client } = require("../../../utils/paypalConfig");

const capturePayment = async (req, res) => {
  const { logger, body } = req;
  const { orderId } = body;
  if (!orderId) {
    return Response.error({
      res,
      status: STATUS_CODE.BAD_REQUEST,
      msg: ERROR_MSGS.MISSING_ORDERID,
    });
  }

  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await client().execute(request);

    if (capture.result.status !== "COMPLETED") {
      return Response.error({
        res,
        status: STATUS_CODE.BAD_REQUEST,
        msg: "Order has not been completed. Please ensure the order is approved before capturing.",
      });
    }

    return Response.success({
      res,
      status: STATUS_CODE.OK,
      msg: INFO_MSGS.SUCCESS,
      data: capture.result,
    });
  } catch (error) {
    console.log("capturePayment Error: ", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  capturePayment,
};
