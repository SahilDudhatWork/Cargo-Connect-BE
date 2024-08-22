const { Router } = require("express");
const { create } = require("../../controller/carrier/operator/create");
const { fetchData } = require("../../controller/carrier/operator/fetchData");
const { getDetails } = require("../../controller/carrier/operator/getDetails");
const { update } = require("../../controller/carrier/operator/update");
const { remove } = require("../../controller/carrier/operator/delete");
const router = Router();

router.post("/", create);
router.get("/", fetchData);
router.get("/:id", getDetails);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
