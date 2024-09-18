const { Router } = require("express");
const router = Router();
const { logIn } = require("../../controller/admin/auth/logIn");
// const { signUp } = require("../../controller/admin/auth/signUp");
const { refreshToken } = require("../../controller/admin/auth/refreshToken");
const {
  validateEmailAndPassword,
} = require("../../middleware/validateEmailAndPass");
const { refreshAuth } = require("../../middleware/authToken/refreshAuth");

router.post("/logIn", validateEmailAndPassword, logIn);
router.post("/token", refreshAuth, refreshToken);

// router.post("/signUp", validateEmailAndPassword, signUp);

module.exports = router;
