const { Router } = require("express");
const router = Router();

const { getRoles } = require("../../controller/admin/roles/getRoles");
const { create } = require("../../controller/admin/roles/create");
const { remove } = require("../../controller/admin/roles/delete");
const { getDetails } = require("../../controller/admin/roles/getDetails");
const { update } = require("../../controller/admin/roles/update");

router.post("/", create);
router.get("/", getRoles);
router.put("/:id", update);
router.get("/:id", getDetails);
router.delete("/:id", remove);

module.exports = router;
