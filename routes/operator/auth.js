const { Router } = require("express");
const router = Router();
const { sentOtp } = require("../../controller/operator/auth/sentOtp");
const {
  verifyAndLogin,
} = require("../../controller/operator/auth/verifyAndLogin");

router.post("/sentOtp", sentOtp);
router.post("/logIn", verifyAndLogin);

module.exports = router;
