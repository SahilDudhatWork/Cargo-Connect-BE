const { Router } = require("express");
const { signUp } = require("../../controller/user/auth/signUp");
const { logIn } = require("../../controller/user/auth/logIn");
const { logOut } = require("../../controller/user/auth/logOut");
const { userAuth } = require("../../middleware/userAuth");
const router = Router();

router.post("/signUp", signUp);
router.post("/logIn", logIn);

router.use(userAuth);
router.post("/logOut", logOut);

module.exports = router;
