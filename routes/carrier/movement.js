const { Router } = require("express");
const {
  fetchMovement,
} = require("../../controller/carrier/movement/getMovement");
const { getDetails } = require("../../controller/carrier/movement/getDetails");
const { hendleRequest } = require("../../controller/carrier/movement/hendleRequest");

const router = Router();

router.get("/", fetchMovement);
router.get("/:id", getDetails);
router.put("/:id", hendleRequest);

module.exports = router;
