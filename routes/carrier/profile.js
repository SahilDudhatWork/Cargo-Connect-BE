const { Router } = require("express");
const {
  fetchProfile,
} = require("../../controller/carrier/profile/fetchProfile");
const {
  uploadMiddleware,
  update,
} = require("../../controller/carrier/profile/update");

const router = Router();

router.get("/", fetchProfile);
router.put("/", uploadMiddleware, update);

module.exports = router;
