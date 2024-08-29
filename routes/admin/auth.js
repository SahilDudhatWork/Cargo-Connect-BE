const { Router } = require("express");
const router = Router();
const { logIn } = require("../../controller/admin/auth/logIn");
// const { signUp } = require("../../controller/admin/auth/signUp");
const {
  validateEmailAndPassword,
} = require("../../middleware/validateEmailAndPass");

router.post("/logIn", validateEmailAndPassword, logIn);
// router.post("/signUp", validateEmailAndPassword, signUp);

module.exports = router;
