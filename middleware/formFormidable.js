const formidable = require("formidable");

const handleFormData = (req, res, next) => {
  const form = new formidable.IncomingForm({ multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    console.log("files :>> ", files);
    console.log("fields :>> ", fields);
    req.files = files;
    req.data = fields;
    next();
  });
};

module.exports = { handleFormData };
