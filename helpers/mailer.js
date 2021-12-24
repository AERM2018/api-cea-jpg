const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: `${process.env.CONTROL_ESCOLAR_EMAIL}`, 
    pass: `${process.env.CONTROL_ESCOLAR_PASSWORD}`,
  },
});

transporter.verify().then( () => console.log("READY FOR SENDING EMAILS"))
module.exports = {
  transporter,
};
