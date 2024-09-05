const { Router } = require("express");
const router = Router();
const {
  userActivity,
} = require("../../controller/admin/common/activity/userActivity");
const {
  carrierActivity,
} = require("../../controller/admin/common/activity/carrierActivity");
const {
  serviceActivity,
} = require("../../controller/admin/common/activity/serviceActivity");

router.get("/user", userActivity);
router.get("/carrier", carrierActivity);
router.get("/service", serviceActivity);

module.exports = router;
