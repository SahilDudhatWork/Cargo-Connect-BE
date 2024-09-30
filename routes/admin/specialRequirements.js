const { Router } = require("express");
const router = Router();
const { create } = require("../../controller/admin/specialRequirements/create");
const { update } = require("../../controller/admin/specialRequirements/update");
const { getAll } = require("../../controller/admin/specialRequirements/getAll");
const {
  getDetails,
} = require("../../controller/admin/specialRequirements/getDetails");
const {
  removeData,
} = require("../../controller/admin/specialRequirements/delete");

router.post("/", create);
router.get("/", getAll);
router.put("/:id", update);
router.get("/:id", getDetails);
router.delete("/:id", removeData);

module.exports = router;
