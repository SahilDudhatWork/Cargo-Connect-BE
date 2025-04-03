const { Router } = require("express");
const { logIn } = require("../../controller/user/auth/logIn");
const { logOut } = require("../../controller/user/auth/logOut");
const { userAuth } = require("../../middleware/authToken/userAuth");
const { refreshAuth } = require("../../middleware/authToken/refreshAuth");
const {
  uploadMiddleware,
  signUp,
} = require("../../controller/user/auth/signUp");
const {
  validateEmailAndPassword,
} = require("../../middleware/validateEmailAndPass");
const { refreshToken } = require("../../controller/user/auth/refreshToken");
const router = Router();

router.post("/signUp", uploadMiddleware, validateEmailAndPassword, signUp);
router.post("/logIn", validateEmailAndPassword, logIn);
router.post("/token", refreshAuth, refreshToken);

router.use(userAuth);
router.post("/logOut", logOut);

module.exports = router;
