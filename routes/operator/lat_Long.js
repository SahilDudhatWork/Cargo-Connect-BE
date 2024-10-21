const { Router } = require("express");
const { createData } = require("../../controller/operator/lat_Long/create");
const router = Router();

router.post("/", createData);

module.exports = router;
