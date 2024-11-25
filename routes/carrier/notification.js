const { Router } = require("express");
const { update } = require("../../controller/carrier/notification/tokenUpdate");

const router = Router();

router.put("/token", update);

module.exports = router;
