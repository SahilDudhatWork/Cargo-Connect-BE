const { Router } = require("express");
const { create } = require("../../controller/carrier/vehicle/create");
const { fetchData } = require("../../controller/carrier/vehicle/fetchData");
const { getDetails } = require("../../controller/carrier/vehicle/getDetails");
const { update } = require("../../controller/carrier/vehicle/update");
const { remove } = require("../../controller/carrier/vehicle/delete");
const {
  fetchTransitInfo,
} = require("../../controller/carrier/vehicle/fetchTransitInfo");
const router = Router();

router.post("/", create);
router.get("/", fetchData);
router.get("/:id", getDetails);
router.put("/:id", update);
router.delete("/:id", remove);
router.get("/fetch/transitInfo", fetchTransitInfo);

module.exports = router;
