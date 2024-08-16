const { Router } = require("express");
const router = Router();
const { signUp } = require("../../controller/carrier/auth/signUp");
const { logIn } = require("../../controller/carrier/auth/logIn");
const { logOut } = require("../../controller/carrier/auth/logOut");
const {
  resetPassword,
} = require("../../controller/carrier/auth/resetPassword");
const { carrierAuth } = require("../../middleware/carrierAuth");
const { verifyOtpToken } = require("../../middleware/verifyOtpToken");

router.post("/signUp", signUp);
router.post("/logIn", logIn);
router.post("/resetPassword", verifyOtpToken, resetPassword);

router.use(carrierAuth);
router.post("/logOut", logOut);

module.exports = router;
