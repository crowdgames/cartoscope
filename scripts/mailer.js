/**
 * Created by kiprasad on 21/08/16.
 */

var nodemailer = require('nodemailer');
var email = process.env.MAILER;

exports.mailer = function(toAddr, subject, htmlBody) {
  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport('smtps://'+ email + ':ubniczgesmweduzd@smtp.gmail.com');

  var mailOptions = {
    from: 'Converge <' + email+ '>', // sender address
    to: toAddr,
    subject: subject,
    html: htmlBody
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });

};
