const { Router } = require("express");
const { create } = require("../../controller/admin/rateCard/create");
const { fetchData } = require("../../controller/admin/rateCard/fetchData");
const { getDetails } = require("../../controller/admin/rateCard/getDetails");
const { update } = require("../../controller/admin/rateCard/update");
const { remove } = require("../../controller/admin/rateCard/delete");
const { carrierAssign } = require("../../controller/admin/rateCard/carrierAssign");
const { fetchAllServices } = require("../../controller/admin/rateCard/fetchAllServices");
const router = Router();

router.post("/", create);
router.get("/", fetchData);
router.get("/:id", getDetails);
router.put("/:id", update);
router.delete("/:id", remove);
router.get("/fetch/All/Services", fetchAllServices);
router.put("/carrierAssign/:id/:carrierAccId", carrierAssign);

module.exports = router;
