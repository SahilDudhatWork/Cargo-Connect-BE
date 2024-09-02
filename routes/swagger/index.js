const { Router } = require("express");
const swaggerUi = require("swagger-ui-express");
const adminSwagger = require("../../swaggerAi/admin_openapi.json");
const userSwagger = require("../../swaggerAi/user_openapi.json");
const carrierSwagger = require("../../swaggerAi/carrier_openapi.json");
const operatorSwagger = require("../../swaggerAi/operator_openapi.json");
const router = Router();

const options = {
  explorer: false,
  swaggerOptions: {
    urls: [
      {
        url: "http://localhost:5555/v1/swagger/admin/api-docs",
        name: "Admin API",
      },
      {
        url: "http://localhost:5555/v1/swagger/user/api-docs",
        name: "User API",
      },
      {
        url: "http://localhost:5555/v1/swagger/carrier/api-docs",
        name: "Carrier API",
      },
      {
        url: "http://localhost:5555/v1/swagger/operator/api-docs",
        name: "Operator API",
      },
    ],
  },
};

router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(null, options));

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
router.use(
  "/operator/api-docs",
  swaggerUi.serveFiles(operatorSwagger),
  swaggerUi.setup(operatorSwagger)
);

module.exports = router;

// const { Router } = require("express");
// const swaggerUi = require("swagger-ui-express");
// const adminSwagger = require("../../swaggerAi/admin_openapi.json");
// const userSwagger = require("../../swaggerAi/user_openapi.json");
// const carrierSwagger = require("../../swaggerAi/carrier_openapi.json");
// const operatorSwagger = require("../../swaggerAi/operator_openapi.json");
// const router = Router();

// router.use(
//   "/admin/api-docs",
//   swaggerUi.serveFiles(adminSwagger),
//   swaggerUi.setup(adminSwagger)
// );
// router.use(
//   "/user/api-docs",
//   swaggerUi.serveFiles(userSwagger),
//   swaggerUi.setup(userSwagger)
// );
// router.use(
//   "/carrier/api-docs",
//   swaggerUi.serveFiles(carrierSwagger),
//   swaggerUi.setup(carrierSwagger)
// );
// router.use(
//   "/operator/api-docs",
//   swaggerUi.serveFiles(operatorSwagger),
//   swaggerUi.setup(operatorSwagger)
// );

// module.exports = router;
