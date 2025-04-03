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
const { refreshToken } = require("../../controller/carrier/auth/refreshToken");
const {
  checkPermissions,
} = require("../../controller/carrier/auth/checkPermissions");
const {
  validateEmailAndPassword,
} = require("../../middleware/validateEmailAndPass");

router.post("/signUp", uploadMiddleware, validateEmailAndPassword, signUp);
router.post("/logIn", validateEmailAndPassword, logIn);
router.post("/token", refreshAuth, refreshToken);

router.use(carrierAuth);
router.post("/logOut", logOut);
router.get("/checkPermissions", checkPermissions);

module.exports = router;
