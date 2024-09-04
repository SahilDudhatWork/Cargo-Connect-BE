const { Router } = require("express");
const { addRating } = require("../../controller/carrier/rating/addRating");
const { getRating } = require("../../controller/carrier/rating/getRating");

const router = Router();

router.post("/:movementId", addRating);
router.get("/:movementId", getRating);

module.exports = router;
