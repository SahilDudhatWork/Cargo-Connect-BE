const { Router } = require("express");
const { updateData } = require("../../controller/admin/setting/updateData");
const { fetchData } = require("../../controller/admin/setting/fetchData");
const router = Router();

router.put("/coordinates", updateData);
router.get("/coordinates", fetchData);

module.exports = router;
