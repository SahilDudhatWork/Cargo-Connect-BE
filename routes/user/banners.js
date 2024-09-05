const { Router } = require("express");
const { fetchBanners } = require("../../controller/user/banners/fetchBanners");
const router = Router();

router.get("/", fetchBanners);

module.exports = router;
