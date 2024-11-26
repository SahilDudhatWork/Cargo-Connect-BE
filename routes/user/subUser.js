const { Router } = require("express");
const { createSubUser } = require("../../controller/user/subUser/create");
const {
  fetchSubUsers,
} = require("../../controller/user/subUser/fetchSubUsers");
const { updateSubUser } = require("../../controller/user/subUser/update");
const { getDetails } = require("../../controller/user/subUser/getDetails");
const { deleteUser } = require("../../controller/user/subUser/delete");
const router = Router();

router.post("/", createSubUser);
router.get("/", fetchSubUsers);
router.put("/:id", updateSubUser);
router.get("/:id", getDetails);
router.delete("/:id", deleteUser);

module.exports = router;
