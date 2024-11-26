const { Router } = require("express");
const router = Router();

const { getRoles } = require("../../controller/carrier/roles/getRoles");
const { create } = require("../../controller/carrier/roles/create");
const { remove } = require("../../controller/carrier/roles/delete");
const { getDetails } = require("../../controller/carrier/roles/getDetails");
const { update } = require("../../controller/carrier/roles/update");

router.post("/", create);
router.get("/", getRoles);
router.put("/:id", update);
router.get("/:id", getDetails);
router.delete("/:id", remove);

module.exports = router;
