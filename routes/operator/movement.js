const { Router } = require("express");
const {
  fetchMovement,
} = require("../../controller/operator/movement/getMovement");
const { getDetails } = require("../../controller/operator/movement/getDetails");
const {
  activeDeactive,
} = require("../../controller/operator/movement/activeDeactive");

const router = Router();

router.put("/status", activeDeactive);
router.get("/", fetchMovement);
router.get("/:id", getDetails);

module.exports = router;
