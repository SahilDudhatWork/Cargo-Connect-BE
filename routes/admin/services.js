const { Router } = require("express");
const router = Router();
const {
  fetchMovement,
} = require("../../controller/admin/services/getMovement");
const { getDetails } = require("../../controller/admin/services/getDetails");
const {
  hendleRequest,
} = require("../../controller/admin/services/hendleRequest");
const {
  referenceValidate,
} = require("../../controller/admin/services/referenceValidate");

router.post("/reference/validate", referenceValidate);
router.get("/", fetchMovement);
router.get("/:id", getDetails);
router.put("/:id", hendleRequest);

module.exports = router;
