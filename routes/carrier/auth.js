const { Router } = require("express");
const router = Router();
const {
  uploadMiddleware,
  signUp,
} = require("../../controller/carrier/auth/signUp");
const { logIn } = require("../../controller/carrier/auth/logIn");
const { logOut } = require("../../controller/carrier/auth/logOut");
const { carrierAuth } = require("../../middleware/authToken/carrierAuth");
const { refreshAuth } = require("../../middleware/authToken/refreshAuth");
const {
  verifyLoginOtp,
} = require("../../controller/carrier/auth/verifyLoginOtp");
const { refreshToken } = require("../../controller/carrier/auth/refreshToken");
const {
  validateEmailAndPassword,
} = require("../../middleware/validateEmailAndPass");

router.post("/signUp", uploadMiddleware, validateEmailAndPassword, signUp);
router.post("/logIn", validateEmailAndPassword, logIn);
router.post("/token", refreshAuth, refreshToken);
router.post("/verifyOtp", verifyLoginOtp);

router.use(carrierAuth);
router.post("/logOut", logOut);

module.exports = router;
