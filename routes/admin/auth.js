const { Router } = require("express");
const router = Router();
const { logIn } = require("../../controller/admin/auth/logIn");

router.post("/logIn", logIn);

module.exports = router;
