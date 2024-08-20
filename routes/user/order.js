const { Router } = require("express");
const { createOrder } = require("../../controller/user/order/createOrder");
const { fetchOrder } = require("../../controller/user/order/fetchOrder");
const { getDetails } = require("../../controller/user/order/getDetails");

const router = Router();

router.post("/", createOrder);
router.get("/", fetchOrder);
router.get("/:id", getDetails);

module.exports = router;
