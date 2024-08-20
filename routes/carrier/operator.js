const { Router } = require("express");
const { create } = require("../../controller/carrier/operator/create");
const router = Router();

router.post("/", create);

module.exports = router;
