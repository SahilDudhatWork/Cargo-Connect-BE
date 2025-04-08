const { Router } = require("express");
const {
  update,
} = require("../../controller/operator/notification/tokenUpdate");
const {
  getNotification,
} = require("../../controller/operator/notification/getNotification");
const {
  notificationUpdate,
} = require("../../controller/common/notification/notificationUpdate");
const {
  notificationMarkAllRead,
} = require("../../controller/operator/notification/notificationMarkAllRead");

const router = Router();

router.get("/", getNotification);
router.put("/mark/read/:id", notificationUpdate);
router.put("/mark/all/read", notificationMarkAllRead);
router.put("/token", update);

module.exports = router;
