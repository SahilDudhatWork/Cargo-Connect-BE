const { Router } = require("express");
const { create } = require("../../controller/admin/operator/create");
const { fetchData } = require("../../controller/admin/operator/fetchData");
const { fetchDataByCarrier } = require("../../controller/admin/operator/fetchDataByCarrier");
const { getDetails } = require("../../controller/admin/operator/getDetails");
const { update } = require("../../controller/admin/operator/update");
const { remove } = require("../../controller/admin/operator/delete");
const router = Router();

router.post("/", create);
router.get("/", fetchData);
router.get("/fetch/:carrierId", fetchDataByCarrier);
router.get("/:id", getDetails);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
