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

  const encryptUser = encrypt(id, process.env.USER_ENCRYPTION_KEY);

  const [accessToken, refreshToken] = await Promise.all([
    commonAuth(encryptUser, ACCESS_TIME, ACCESS_TOKEN, "Access", role),
    commonAuth(
      encryptUser,
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

const commonAuth = async (encryptUser, expiresIn, secret, type, role) => {
  try {
    return await generateJWTToken({
      encryptUser,
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
  encryptUser,
  expiresIn,
  secret,
  type,
  role,
}) => {
  try {
    return jwt.sign({ userId: encryptUser, type, role }, secret, { expiresIn });
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = tokenGenerate;
