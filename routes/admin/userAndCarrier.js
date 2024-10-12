const { Router } = require("express");
const router = Router();
const {
  uploadMiddleware,
  create,
} = require("../../controller/admin/common/userAndCarrier/create");
const {
  fetchData,
} = require("../../controller/admin/common/userAndCarrier/fetchData");
const {
  getDetails,
} = require("../../controller/admin/common/userAndCarrier/getDetails");
const {
  update,
} = require("../../controller/admin/common/userAndCarrier/update");
const {
  remove,
} = require("../../controller/admin/common/userAndCarrier/delete");
const {
  verify,
} = require("../../controller/admin/common/userAndCarrier/verify");
const {
  unverify,
} = require("../../controller/admin/common/userAndCarrier/unverify");
const {
  fetchReferences,
} = require("../../controller/admin/common/userAndCarrier/references");
const {
  validateEmailAndPassword,
} = require("../../middleware/validateEmailAndPass");

router.post("/:type/", uploadMiddleware, validateEmailAndPassword, create);
router.get("/:type/", fetchData);
router.get("/:type/:id", getDetails);
router.put("/:type/:id", uploadMiddleware, update);
router.delete("/:type/:id", remove);
router.post("/verify/:type/:id", verify);
router.delete("/unverify/:type/:id", unverify);
router.get("/references/:type/:id", fetchReferences);

module.exports = router;
