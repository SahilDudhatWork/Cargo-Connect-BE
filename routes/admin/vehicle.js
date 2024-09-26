const { Router } = require("express");
const { create } = require("../../controller/admin/vehicle/create");
const { fetchData } = require("../../controller/admin/vehicle/fetchData");
const { getDetails } = require("../../controller/admin/vehicle/getDetails");
const { update } = require("../../controller/admin/vehicle/update");
const { remove } = require("../../controller/admin/vehicle/delete");
const { hendleStatus } = require("../../controller/admin/vehicle/hendleStatus");
const router = Router();

router.post("/", create);
router.get("/fetch/:carrierId", fetchData);
router.get("/:id", getDetails);
router.put("/:id", update);
router.put("/status/:id", hendleStatus);
router.delete("/:id", remove);

module.exports = router;
