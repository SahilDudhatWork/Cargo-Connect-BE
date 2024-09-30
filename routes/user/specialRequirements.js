const { Router } = require("express");
const router = Router();
const { getAll } = require("../../controller/user/specialRequirements/getAll");
const {
  getDetails,
} = require("../../controller/user/specialRequirements/getDetails");

router.get("/", getAll);
router.get("/:id", getDetails);

module.exports = router;
