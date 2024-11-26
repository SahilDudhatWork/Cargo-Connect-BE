const { Router } = require("express");
const router = Router();

const { getMenus } = require("../../controller/carrier/menuAccess/getMenus");
const { create } = require("../../controller/carrier/menuAccess/create");
const { remove } = require("../../controller/carrier/menuAccess/delete");
const { getDetails } = require("../../controller/carrier/menuAccess/getDetails");
const { update } = require("../../controller/carrier/menuAccess/update");

router.post("/", create);
router.get("/", getMenus);
router.put("/:id", update);
router.get("/:id", getDetails);
router.delete("/:id", remove);

module.exports = router;
