const { Router } = require("express");
const router = Router();

const { sentToken } = require("../../controller/common/tokenVerify/sentToken");

router.post("/:type", sentToken);

module.exports = router;
