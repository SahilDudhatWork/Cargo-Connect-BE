const { Router } = require("express");
const { update } = require("../../controller/user/notification/tokenUpdate");

const router = Router();

router.put("/token", update);

module.exports = router;
