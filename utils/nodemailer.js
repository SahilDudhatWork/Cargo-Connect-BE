const nodemailer = require("nodemailer");

const VerificationEmail = (receiver, OtpCode, OtpType = "login") => {
  console.table([{ receiver: receiver, OtpCode: OtpCode }]);
  var transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587, // Use port 587 for secure TLS connection
    secure: true,
    auth: {
      user: "karmafeb111@gmail.com",
      pass: "ssfc spyx actn cqkp",
    },
  });

  var mailOptions = {
    from: "Cargo Connect : sahildudhat03@gmail.com",
    to: receiver,
    subject: "Email Verification",
    html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
              <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                  <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Cargo Connect</a>
                </div>
                <p style="font-size:1.1em">Hi,</p>
                <p>Thank you for choosing Cargo Connect. Please use the OTP below to log in. The OTP is valid for 5 minutes.</p>
                <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OtpCode}</h2>
                <p style="font-size:0.9em;">Regards,<br />Cargo Connect</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                  <p>Cargo Connect Inc</p>
                  <p>1600 Amphitheatre Parkway</p>
                  <p>California</p>
                </div>
              </div>
            </div>`,
  };
  if (OtpType == "forgot") {
    mailOptions = {
      from: "Cargo Connect : sahildudhat03@gmail.com",
      to: receiver,
      subject: "Email Verification",
      html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                <div style="margin:50px auto;width:70%;padding:20px 0">
                  <div style="border-bottom:1px solid #eee">
                    <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Cargo Connect</a>
                  </div>
                  <p style="font-size:1.1em">Hi,</p>
                  <p>Thank you for choosing Cargo Connect. Use the following OTP to reset your password. This OTP is valid for 5 minutes.</p>
                  <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OtpCode}</h2>
                  <p style="font-size:0.9em;">Regards,<br />Cargo Connect</p>
                  <hr style="border:none;border-top:1px solid #eee" />
                  <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                    <p>Cargo Connect Inc</p>
                    <p>1600 Amphitheatre Parkway</p>
                    <p>California</p>
                  </div>
                </div>
              </div>`,
    };
  }

  return new Promise((resolve, reject) => {
    transporter
      .sendMail(mailOptions)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err.message);
      });
  });
};
const sendNotification = (receiver, msg, contactName, subject) => {

  var transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587, // Use port 587 for secure TLS connection
    secure: true,
    auth: {
      user: "karmafeb111@gmail.com",
      pass: "ssfc spyx actn cqkp",
    },
  });

  var mailOptions = {
    from: "Cargo Connect : sahildudhat03@gmail.com",
    to: receiver,
    subject: subject,
    html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
              <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                  <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Cargo Connect</a>
                </div>
                <p style="font-size:1.1em">Hi, ${contactName}</p>
                <p>${msg}</p>
                <p style="font-size:0.9em;">Regards,<br />Cargo Connect</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                  <p>Cargo Connect Inc</p>
                  <p>1600 Amphitheatre Parkway</p>
                  <p>California</p>
                </div>
              </div>
            </div>`,
  };

  return new Promise((resolve, reject) => {
    transporter
      .sendMail(mailOptions)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err.message);
      });
  });
};

module.exports = {
  VerificationEmail,
  sendNotification,
};
