const { Router } = require("express");
const { sentOtp } = require("../../controller/common/otp/sentOtp");
const { verifyOtp } = require("../../controller/common/otp/verifyOtp");
const router = Router();

router.post("/sent/:type", sentOtp);
router.post("/verify", verifyOtp);

module.exports = router;
