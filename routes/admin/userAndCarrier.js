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
  validateEmailAndPassword,
} = require("../../middleware/validateEmailAndPass");

router.post("/:type/", uploadMiddleware, validateEmailAndPassword, create);
router.get("/:type/", fetchData);
router.get("/:type/:id", getDetails);
router.put("/:type/:id", uploadMiddleware, validateEmailAndPassword, update);
router.delete("/:type/:id", remove);

module.exports = router;
