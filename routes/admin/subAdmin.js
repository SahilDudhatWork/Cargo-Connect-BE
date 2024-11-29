const { Router } = require("express");
const router = Router();
const { getAdmins } = require("../../controller/admin/subAdmin/getAdmins");
const { createAdmin } = require("../../controller/admin/subAdmin/create");
const { remove } = require("../../controller/admin/subAdmin/delete");
const { getDetails } = require("../../controller/admin/subAdmin/getDetails");
const { update } = require("../../controller/admin/subAdmin/update");
const {
  validateEmailAndPassword,
} = require("../../middleware/validateEmailAndPass");

router.post("/", validateEmailAndPassword, createAdmin);
router.get("/", getAdmins);
router.put("/:id", update);
router.get("/:id", getDetails);
router.delete("/:id", remove);

module.exports = router;
