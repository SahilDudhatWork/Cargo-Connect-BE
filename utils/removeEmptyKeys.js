const removeEmptyKeys = (obj) => {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (obj[key] && typeof obj[key] === "object") {
        removeEmptyKeys(obj[key]);
        if (Object.keys(obj[key]).length === 0) {
          delete obj[key];
        }
      } else if (obj[key] === null || obj[key] === "") {
        delete obj[key];
      }
    }
  }
};

module.exports = { removeEmptyKeys };
