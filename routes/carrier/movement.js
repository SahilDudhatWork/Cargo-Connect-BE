const { Router } = require("express");
const {
  fetchMovement,
} = require("../../controller/carrier/movement/getMovement");
const { getDetails } = require("../../controller/carrier/movement/getDetails");
const {
  hendleRequest,
} = require("../../controller/carrier/movement/hendleRequest");
const {
  movementComplete,
} = require("../../controller/carrier/movement/movementComplete");
const {
  referenceValidate,
} = require("../../controller/carrier/movement/referenceValidate");

const router = Router();

router.get("/", fetchMovement);
router.get("/:id", getDetails);
router.post("/reference/validate", referenceValidate);
router.put("/:id", hendleRequest);
router.put("/complete/:id", movementComplete);

module.exports = router;
