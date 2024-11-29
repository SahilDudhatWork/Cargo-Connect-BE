const { Router } = require("express");
const { createSubCarrier } = require("../../controller/carrier/subCarrier/create");
const {
  fetchSubCarriers,
} = require("../../controller/carrier/subCarrier/fetchSubCarriers");
const { updateSubCarrier } = require("../../controller/carrier/subCarrier/update");
const { getDetails } = require("../../controller/carrier/subCarrier/getDetails");
const { deleteCarrier } = require("../../controller/carrier/subCarrier/delete");
const router = Router();

router.post("/", createSubCarrier);
router.get("/", fetchSubCarriers);
router.put("/:id", updateSubCarrier);
router.get("/:id", getDetails);
router.delete("/:id", deleteCarrier);

module.exports = router;
