const { Router } = require("express");
const { logIn } = require("../../controller/user/auth/logIn");
const { logOut } = require("../../controller/user/auth/logOut");
const { userAuth } = require("../../middleware/authToken/userAuth");
const {
  uploadMiddleware,
  signUp,
} = require("../../controller/user/auth/signUp");
const {
  validateEmailAndPassword,
} = require("../../middleware/validateEmailAndPass");
const router = Router();

router.post("/signUp", uploadMiddleware, validateEmailAndPassword, signUp);
router.post("/logIn", validateEmailAndPassword, logIn);

router.use(userAuth);
router.post("/logOut", logOut);

module.exports = router;
