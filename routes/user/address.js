const { Router } = require("express");
const { create } = require("../../controller/user/address/create");
const { fetchData } = require("../../controller/user/address/fetchData");
const { getDetails } = require("../../controller/user/address/getDetails");
const { update } = require("../../controller/user/address/update");
const { remove } = require("../../controller/user/address/delete");
const router = Router();

router.post("/", create);
router.get("/", fetchData);
router.get("/:id", getDetails);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
