const twilio = require("twilio");
const {
  TWILIO_ACCOUNT_SID: accountSid,
  TWILIO_AUTH_TOKEN: authToken,
  TWILIO_PHONE_NUMBER: twilioPhoneNumber,
} = process.env;
const client = new twilio(accountSid, authToken);

const twilioSendOtp = (to, otp) => {
  const messageBody = `Dear Customer, your One-Time Password (OTP) for Cargo Connect is: ${otp}.
   This code is valid for the next 5 minutes.
    Please do not share this OTP with anyone.`;

  return client.messages
    .create({
      body: messageBody,
      to: to,
      from: twilioPhoneNumber,
    })
    .then((message) => {
      console.log(`OTP sent: ${message.sid}`);
      return {
        success: true,
        messageId: message.sid,
        status: "OTP sent successfully",
      };
    })
    .catch((error) => {
      console.error("Error sending OTP:", error);
      return {
        success: false,
        error: error.message,
        status: "Failed to send OTP",
      };
    });
};

module.exports = twilioSendOtp;
