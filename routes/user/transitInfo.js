const { Router } = require("express");
const { fetchService } = require("../../controller/user/transitInfo/fetchTransitInfo");
const {
  typeOfService,
} = require("../../controller/user/transitInfo/typeOfService");
const { userAuth } = require("../../middleware/authToken/userAuth");
const {
  userPermission,
} = require("../../middleware/permission/userPermission");
const router = Router();

router.get("/typeOfService", typeOfService);
router.use(userAuth);
router.use(userPermission);
router.get("/", fetchService);

module.exports = router;
