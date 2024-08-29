const { Router } = require("express");
const swaggerUi = require("swagger-ui-express");
const adminSwagger = require("../../swaggerAi/admin_openapi.json");
const userSwagger = require("../../swaggerAi/user_openapi.json");
const carrierSwagger = require("../../swaggerAi/carrier_openapi.json");

const router = Router();

router.use(
  "/admin/api-docs",
  swaggerUi.serveFiles(adminSwagger),
  swaggerUi.setup(adminSwagger)
);
router.use(
  "/user/api-docs",
  swaggerUi.serveFiles(userSwagger),
  swaggerUi.setup(userSwagger)
);
router.use(
  "/carrier/api-docs",
  swaggerUi.serveFiles(carrierSwagger),
  swaggerUi.setup(carrierSwagger)
);

module.exports = router;
