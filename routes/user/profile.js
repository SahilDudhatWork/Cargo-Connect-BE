const { Router } = require("express");
const { fetchProfile } = require("../../controller/user/profile/fetchProfile");
const {
  uploadMiddleware,
  update,
} = require("../../controller/user/profile/update");
const router = Router();

router.get("/", fetchProfile);
router.put("/", uploadMiddleware, update);

module.exports = router;
