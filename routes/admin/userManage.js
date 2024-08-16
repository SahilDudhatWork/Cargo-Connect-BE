const { Router } = require("express");
const router = Router();
const { create } = require("../../controller/admin/manageUser/create");
const { fetchUser } = require("../../controller/admin/manageUser/fetchUser");
const { getDetails } = require("../../controller/admin/manageUser/getDetails");
const { update } = require("../../controller/admin/manageUser/update");
const { remove } = require("../../controller/admin/manageUser/delete");

router.post("/", create);
router.get("/", fetchUser);
router.get("/:id", getDetails);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
