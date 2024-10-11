const { Router } = require("express");
const { createOrder } = require("../../controller/user/movement/createOrder");
const { fetchOrder } = require("../../controller/user/movement/fetchOrder");
const { getDetails } = require("../../controller/user/movement/getDetails");
const {
  userPermission,
} = require("../../middleware/permission/userPermission");
const {
  fetchReference,
} = require("../../controller/user/movement/fetchReference");
const {
  coordinatesPrice,
} = require("../../controller/user/movement/coordinatesPrice");
const router = Router();

router.get("/reference", fetchReference);
router.use(userPermission);
router.post("/coordinatesPrice", coordinatesPrice);
router.post("/", createOrder);
router.get("/", fetchOrder);
router.get("/:id", getDetails);

module.exports = router;
