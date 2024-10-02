const { Router } = require("express");
const router = Router();
const {
  uploadMiddleware,
  createOrUpdate,
} = require("../../controller/admin/banners/createOrUpdate");
const { fetchBanners } = require("../../controller/admin/banners/fetchBanners");
const { bannersDetails } = require("../../controller/admin/banners/bannersDetails");

router.post("/", uploadMiddleware, createOrUpdate);
router.get("/", fetchBanners);
router.get("/:id", bannersDetails);

module.exports = router;
