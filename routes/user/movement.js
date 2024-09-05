const { Router } = require("express");
const { createOrder } = require("../../controller/user/movement/createOrder");
const { fetchOrder } = require("../../controller/user/movement/fetchOrder");
const { getDetails } = require("../../controller/user/movement/getDetails");
const {
  fetchReference,
} = require("../../controller/user/movement/fetchReference");
const router = Router();

router.post("/", createOrder);
router.get("/", fetchOrder);
router.get("/reference", fetchReference);
router.get("/:id", getDetails);

module.exports = router;
