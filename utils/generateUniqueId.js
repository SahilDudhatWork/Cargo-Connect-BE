const generateAccountId = () => {
  const timestamp = Date.now().toString();
  const randomDigits = Array(6)
    .fill(0)
    .map(() => Math.floor(Math.random() * 10))
    .join("");
  return timestamp.slice(-10) + randomDigits;
};

module.exports = { generateAccountId };
