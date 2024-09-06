const { Router } = require("express");
const { fetchService } = require("../../controller/user/service/fetchService");
const {
  typeOfService,
} = require("../../controller/user/service/typeOfService");
const {
  userPermission,
} = require("../../middleware/permission/userPermission");
const router = Router();

router.get("/typeOfService", typeOfService);
router.use(userPermission);
router.get("/", fetchService);

module.exports = router;
