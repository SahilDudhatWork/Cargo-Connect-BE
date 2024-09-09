const { Router } = require("express");
const {
  addOrUpdateRating,
} = require("../../controller/carrier/rating/addRating");
const { getRating } = require("../../controller/carrier/rating/getRating");

const router = Router();

router.post("/:movementId", addOrUpdateRating);
router.get("/:movementId", getRating);

module.exports = router;
