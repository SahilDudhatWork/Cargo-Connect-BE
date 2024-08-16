const { Router } = require("express");
const {
  resetPassword,
} = require("../../controller/common/forgotPassword/resetPassword");
const { verifyOtpToken } = require("../../middleware/verifyOtpToken");
const router = Router();

router.post("/:type", verifyOtpToken, resetPassword);

module.exports = router;
