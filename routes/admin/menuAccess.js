const { Router } = require("express");
const router = Router();

const { getMenus } = require("../../controller/admin/menuAccess/getMenus");
const { create } = require("../../controller/admin/menuAccess/create");
const { remove } = require("../../controller/admin/menuAccess/delete");
const { getDetails } = require("../../controller/admin/menuAccess/getDetails");
const { update } = require("../../controller/admin/menuAccess/update");

router.post("/", create);
router.get("/", getMenus);
router.put("/:id", update);
router.get("/:id", getDetails);
router.delete("/:id", remove);

module.exports = router;
