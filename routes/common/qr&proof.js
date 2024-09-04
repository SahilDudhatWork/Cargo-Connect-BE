const { Router } = require("express");
const router = Router();

const {
  uploadQr,
  uploadMiddleware,
} = require("../../controller/common/qr&proof/uploadData");
const { fetchQr } = require("../../controller/common/qr&proof/fetchData");

router.post("/:movementId", uploadMiddleware, uploadQr);
router.get("/:movementId", fetchQr);

module.exports = router;
