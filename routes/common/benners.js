const { Router } = require("express");
const {
  fetchBanners,
} = require("../../controller/common/banners/fetchBanners");
const router = Router();

router.get("/:type", fetchBanners);

module.exports = router;
