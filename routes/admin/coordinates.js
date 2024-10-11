const { Router } = require("express");
const { create } = require("../../controller/admin/coordinates/create");
const { fetchData } = require("../../controller/admin/coordinates/fetchData");
const { getDetails } = require("../../controller/admin/coordinates/getDetails");
const { update } = require("../../controller/admin/coordinates/update");
const { remove } = require("../../controller/admin/coordinates/delete");
const router = Router();

router.post("/", create);
router.get("/", fetchData);
router.get("/:id", getDetails);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
