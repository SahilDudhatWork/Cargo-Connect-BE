const { Router } = require("express");
const router = Router();
const {
  getDetails,
} = require("../../controller/user/specialRequirements/getDetails");

router.post("/", getDetails);

module.exports = router;
