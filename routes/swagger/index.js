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

//  pest collection jason in https://metamug.com/util/postman-to-swagger/
// Response : get openapi swagger formate data
// pest openapi swagger in https://editor.swagger.io/
// file -> save in json format
// and use in Api

// const swaggerJsdoc = require("swagger-jsdoc");
// const postmanToOpenApi = require("postman-to-openapi");

// //GENERATE YML
// router.get('/generate-yml', async (req, res) => {
//     // Postman Collection Path
//     const postmanCollection = 'CargoConnect.postman_collection.json'
//     // Output OpenAPI Path
//     const outputFile = 'collection.yml'
//     // Async/await
//     ////++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//     try {
//         const result = await postmanToOpenApi(postmanCollection, outputFile, {
//             defaultTag: 'General'
//         })
//         const result2 = await postmanToOpenApi(postmanCollection, null, {
//             defaultTag: 'General'
//         })
//         console.log(`OpenAPI specs: ${result}`)
//     } catch (err) {
//         console.log(err)
//     }
// })
