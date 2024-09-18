const { Router } = require("express");
const router = Router();
const { sentOtp } = require("../../controller/operator/auth/sentOtp");
const { refreshToken } = require("../../controller/operator/auth/refreshToken");
const {
  verifyAndLogin,
} = require("../../controller/operator/auth/verifyAndLogin");
const { refreshAuth } = require("../../middleware/authToken/refreshAuth");

router.post("/sentOtp", sentOtp);
router.post("/logIn", verifyAndLogin);
router.post("/token", refreshAuth, refreshToken);

module.exports = router;
