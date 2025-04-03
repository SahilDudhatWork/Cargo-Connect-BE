const jwt = require("jsonwebtoken");
const { hendleModel } = require("./hendleModel");
const { encrypt } = require("../helper/encrypt-decrypt");

const tokenGenerate = async (id, role, deviceToken, webToken) => {
  const Model = await hendleModel(role.toLowerCase());

  const isUser = role === "User";
  const ACCESS_TIME = isUser
    ? process.env.USER_ACCESS_TIME
    : process.env.CARRIER_ACCESS_TIME;
  const ACCESS_TOKEN = isUser
    ? process.env.USER_ACCESS_TOKEN
    : process.env.CARRIER_ACCESS_TOKEN;
  const ENCRYPTION_KEY = isUser
    ? process.env.USER_ENCRYPTION_KEY
    : process.env.CARRIER_ENCRYPTION_KEY;

  const encryptId = encrypt(id, ENCRYPTION_KEY);

  const [accessToken, refreshToken] = await Promise.all([
    commonAuth(encryptId, ACCESS_TIME, ACCESS_TOKEN, "Access", role),
    commonAuth(
      encryptId,
      process.env.REFRESH_TOKEN_TIME,
      process.env.REFRESH_ACCESS_TOKEN,
      "Refresh",
      role
    ),
  ]);

  await Model.findByIdAndUpdate(
    id,
    {
      lastLogin: new Date(),
      token: {
        accessToken,
        refreshToken,
        type: "Access",
        createdAt: new Date(),
      },
      deviceToken,
      webToken,
    },
    { new: true }
  );

  return { accessToken, refreshToken };
};

const commonAuth = async (encryptId, expiresIn, secret, type, role) => {
  try {
    return await generateJWTToken({
      encryptId,
      expiresIn,
      secret,
      type,
      role,
    });
  } catch (error) {
    console.error("commonAuth Error:", error);
    throw error;
  }
};

const generateJWTToken = async ({
  encryptId,
  expiresIn,
  secret,
  type,
  role,
}) => {
  try {
    const payload =
      role === "User"
        ? { userId: encryptId, type, role }
        : { carrierId: encryptId, type, role };

    return jwt.sign(payload, secret, { expiresIn });
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = tokenGenerate;
