const { Router } = require("express");
const router = Router();
const { logIn } = require("../../controller/admin/auth/logIn");
const {
  validateEmailAndPassword,
} = require("../../middleware/validateEmailAndPass");

router.post("/logIn", validateEmailAndPassword, logIn);

module.exports = router;
