const { Router } = require("express");
const router = Router();

const { sentOtp } = require("../../controller/common/otp/sentOtp");
const { verifyOtp } = require("../../controller/common/otp/verifyOtp");
const {
  verifyLoginOtp,
} = require("../../controller/common/otp/verifyLoginOtp");

router.post("/sent/:type", sentOtp);
router.post("/verify", verifyOtp);
router.post("/verify/:type", verifyLoginOtp);

module.exports = router;
