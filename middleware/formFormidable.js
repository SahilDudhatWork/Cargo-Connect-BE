const formidable = require("formidable");

const handleFormData = (req, res, next) => {
  const form = formidable({ multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    req.files = files;
    req.data = fields;
    next();
  });
};

module.exports = { handleFormData };
