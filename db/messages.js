var db = require('../db/db');
var anonUserDB = require('../db/anonUser');

var bcrypt = require('bcryptjs');
var Promise = require('bluebird');
var salt = process.env.CARTO_SALT;
var randomString = require('randomstring');
var databaseName = process.env.CARTO_DB_NAME;
var hitCode = process.env.hitCode;


var mailCentralUSER = process.env.CARTO_MAILER || "";
var mailCentralPWD = process.env.CARTO_MAILER_PWD || "";


/* Mail notifications  */
var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: mailCentralUSER.toString(),
        pass: mailCentralPWD.toString()
    }
});


//Send email Notification
exports.sendEmailNotification = function(to, subject, message) {

    return new Promise(function(resolve, reject) {

        var mailOptions = {
            from: mailCentralUSER,
            to: to,
            subject: subject,
            text: message,
            html: message
        };
        transport.sendMail(mailOptions, function (error, response) {
            transport.close();

            if (error) {
                reject(error);
            } else {
                resolve(response)
            }
        })
    })
};


//send an email to head developer that the hit id has x people consented
// e.g use it in genetic id route for expiring hits
exports.NotifyHITThresholdMet = function(hitID,threshold){

    var hit_id = req.params.hitId;
    //get people
    anonUserDB.countWorkersPerHIT(hit_id).then(function(num_workers) {
        //notify me if the threshold is met


        var mail_subject = "[Cartoscope] Threshold for HIT: " + hit_id + " met (" + num_workers + " workers)";
        var mail_body = "The HIT currently has " + num_workers + " consented workers";

        if (num_workers >= threshold){
            exports.sendEmailNotification(CARTO_MAILER_NOTIFY.toString(),mail_subject,mail_body).then(function(msg) {
                res.status(200).send("Threshold met.");

            }).catch(function(err) {
                console.log(err)
                res.status(500).send({error: err.code});
            });
        } else {
            res.status(200).send("Threshold not satisfied yet.");
        }



    }).catch(function(err) {
        res.status(500).send({error: err.code});
    });
}
