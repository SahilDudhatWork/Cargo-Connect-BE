const paypal = require("@paypal/checkout-server-sdk");
const { PAYPEL_CLIENT_ID: clientId, PAYPEL_SECRET_ID: clientSecret } =
  process.env;

const environment = () => {
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  // Use LiveEnvironment for production
};

const client = () => {
  return new paypal.core.PayPalHttpClient(environment());
};

module.exports = { client };
