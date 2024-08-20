const { Router } = require("express");
const router = Router();
const { signUp } = require("../../controller/carrier/auth/signUp");
const { logIn } = require("../../controller/carrier/auth/logIn");
const { logOut } = require("../../controller/carrier/auth/logOut");

const { carrierAuth } = require("../../middleware/authToken/carrierAuth");

router.post("/signUp", signUp);
router.post("/logIn", logIn);

router.use(carrierAuth);
router.post("/logOut", logOut);

module.exports = router;
