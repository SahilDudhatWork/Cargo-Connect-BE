const { Router } = require("express");
const router = Router();
const { signUp } = require("../../controller/user/auth/signUp");
const { logIn } = require("../../controller/user/auth/logIn");
const { logOut } = require("../../controller/user/auth/logOut");
const { resetPassword } = require("../../controller/user/auth/resetPassword");
const { userAuth } = require("../../middleware/userAuth");
const { verifyOtpToken } = require("../../middleware/verifyOtpToken");

router.post("/signUp", signUp);
router.post("/logIn", logIn);
router.post("/resetPassword", verifyOtpToken, resetPassword);

router.use(userAuth);
router.post("/logOut", logOut);

module.exports = router;
