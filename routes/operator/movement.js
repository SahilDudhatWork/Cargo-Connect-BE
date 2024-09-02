const { Router } = require("express");
const {
  fetchMovement,
} = require("../../controller/operator/movement/getMovement");
const { getDetails } = require("../../controller/operator/movement/getDetails");

const router = Router();

router.get("/", fetchMovement);
router.get("/:id", getDetails);

module.exports = router;
