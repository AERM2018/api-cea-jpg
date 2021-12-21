const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'retana.martinez.angel.eduardo@gmail.com', // generated ethereal user
    pass: 'bfsfrsfusktraixb', // generated ethereal password
  },
});

transporter.verify().then( () => console.log("READY FOR SENDING EMAILS"))
module.exports = {
  transporter,
};
