const { Router } = require("express");
const {
  addOrUpdateRating,
} = require("../../controller/user/rating/addRating");
const { getRating } = require("../../controller/user/rating/getRating");

const router = Router();

router.post("/:movementId", addOrUpdateRating);
router.get("/:movementId", getRating);

module.exports = router;
