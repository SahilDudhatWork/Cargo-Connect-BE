const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const { PORT } = process.env;
const routes = require("./routes/v1");
const path = require("path");
const cors = require("cors");
const logger = require("morgan");
const MongoDBconnect = require("./library/db");

// Body-parser
app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

// For uploaded images acsses
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/swaggerAi", express.static(path.join(__dirname, "swaggerAi")));

const imageUploadRouter = require("./routes/common/imageUpload");
app.use("/upload", imageUploadRouter);

// Routers
app.use("/v1", routes);
app.get("/", (req, res) => {
  res.status(200).json({ message: "Wel Come Our CaRgO cOnNeCt - V1.0.1" });
});

// DB Connection
MongoDBconnect()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`        \x1b[1m\x1b[35m╭──────────────────────────────────╮
        │ \x1b[36m🕒 Application is listening On :   ⋙  🚀 \x1b[91m${PORT} \x1b[32m🚀
        ╰──────────────────────────────────╯\x1b[0m`);
    });
  })
  .catch((error) => {
    console.error("Error Connecting Mongodb:", error);
  });
