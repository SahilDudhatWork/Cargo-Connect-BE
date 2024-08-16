const { Router } = require("express");
const router = Router();

const { sentOtp } = require("../../controller/common/otp/sentOtp");
const { verifyOtp } = require("../../controller/common/otp/verifyOtp");

router.post("/sent/:type", sentOtp);
router.post("/verify", verifyOtp);

module.exports = router;
