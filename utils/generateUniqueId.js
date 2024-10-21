const generateAccountId = () => {
  const timestamp = Date.now().toString();
  const randomDigits = Array(6)
    .fill(0)
    .map(() => Math.floor(Math.random() * 10))
    .join("");
  return timestamp.slice(-10) + randomDigits;
};

const generateNumOrCharId = () => {
  const prefixLength = 10;
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let dynamicPrefix = "";

  for (let i = 0; i < prefixLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    dynamicPrefix += characters[randomIndex];
  }

  const uniqueNumber = Date.now().toString().slice(-10);

  const uniqueId = `${dynamicPrefix}${uniqueNumber}`;
  return uniqueId;
};

const generateMovementId = (lastSequence) => {
  const currentYear = new Date().getFullYear().toString().slice(-2);
  lastSequence += 1;
  const movementId = `CC${currentYear}${String(lastSequence).padStart(6, "0")}`;
  return movementId;
};

module.exports = { generateAccountId, generateNumOrCharId, generateMovementId };
