const { Router } = require("express");
const { imgDelete } = require("../../controller/common/imageDelete/imgDelete");
const router = Router();

router.post("/", imgDelete);

module.exports = router;
