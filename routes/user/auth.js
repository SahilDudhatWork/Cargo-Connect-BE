const { Router } = require("express");
const { signUp } = require("../../controller/user/auth/signUp");
const { logIn } = require("../../controller/user/auth/logIn");
const { logOut } = require("../../controller/user/auth/logOut");
const { userAuth } = require("../../middleware/authToken/userAuth");
const {
  validateEmailAndPassword,
} = require("../../middleware/validateEmailAndPass");
const router = Router();

router.post("/signUp", validateEmailAndPassword, signUp);
router.post("/logIn", validateEmailAndPassword, logIn);

router.use(userAuth);
router.post("/logOut", logOut);

module.exports = router;
