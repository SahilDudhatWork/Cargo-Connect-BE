const { Router } = require("express");
const { fetchService } = require("../../controller/user/service/fetchService");

const router = Router();

router.get("/", fetchService);

module.exports = router;
