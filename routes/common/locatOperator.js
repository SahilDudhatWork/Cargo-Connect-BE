const { Router } = require("express");
const {
  locatOperator,
} = require("../../controller/common/locatOperator/getOperator");
const router = Router();

router.get("/:operatorAccountId", locatOperator);

module.exports = router;
