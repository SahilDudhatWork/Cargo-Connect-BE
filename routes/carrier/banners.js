const { Router } = require("express");
const {
  fetchBanners,
} = require("../../controller/common/banners/fetchBanners");
const router = Router();

router.get("/", fetchBanners);

module.exports = router;
