const { Router } = require("express");
const router = Router();
const { fetchMovement } = require("../../controller/admin/services/getMovement");
const { getDetails } = require("../../controller/admin/services/getDetails");

router.get("/", fetchMovement);
router.get("/:id", getDetails);

module.exports = router;
