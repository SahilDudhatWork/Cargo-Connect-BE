const { Router } = require("express");
const router = Router();
const {
  getDetails,
} = require("../../controller/user/specialRequirements/getDetails");

router.get("/:id", getDetails);

module.exports = router;
