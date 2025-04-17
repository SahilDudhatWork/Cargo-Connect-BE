const { Router } = require("express");
const router = Router();
const { create } = require("../../controller/admin/commonRequirements/create");
const { update } = require("../../controller/admin/commonRequirements/update");
const { getAll } = require("../../controller/admin/commonRequirements/getAll");
const {
  getDetails,
} = require("../../controller/admin/commonRequirements/getDetails");
const {
  removeData,
} = require("../../controller/admin/commonRequirements/delete");

router.post("/:type/:id", create);
router.get("/:type/:id", getAll);
router.put("/:type/:id/:requirementId", update);
router.get("/:type/:id/:requirementId", getDetails);
router.delete("/:type/:id/:requirementId", removeData);

module.exports = router;
