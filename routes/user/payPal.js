const { Router } = require("express");
const {
  capturePayment,
} = require("../../controller/user/payPal/capturePayment");

const router = Router();

router.post("/capture", capturePayment);

module.exports = router;
