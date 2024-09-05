const { Router } = require("express");
const router = Router();
const {
  uploadMiddleware,
  createOrUpdate,
} = require("../../controller/admin/banners/createOrUpdate");
const { fetchBanners } = require("../../controller/admin/banners/fetchBanners");

router.post("/", uploadMiddleware, createOrUpdate);
router.get("/", fetchBanners);

module.exports = router;
