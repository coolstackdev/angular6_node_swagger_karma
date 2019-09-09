// const nodemailer = require('nodemailer');
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.GMAIL,
//         pass: process.env.GMAIL_PW
//     }
// });
const mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_KEY, domain: process.env.DOMAIN});

// sendEmail({
//     to: 'regnise@gmail.com',
//     title: 'Test',
//     content: "<h1>Hello Vasilii</h1>"
// });
/**
 * Emails delivery function
 * @param mailOptions {object} - mail options
 */
function sendEmail(mailOptions) {
    if (mailOptions.to) {
        let data = {
            from: 'VirtuProfs <contact@virtuprofs.com>',
            to: mailOptions.to,
            subject: mailOptions.title,
            html: mailOptions.content,
            attachment: mailOptions.filePath || ''
        };

        mailgun.messages().send(data, function (error, body) {
            if (error) return console.error(error);
            console.log('Mailgun: ', body);
        });

        // let data = {
        //     from: 'VirtuProfs <noreply@virtuprofs.com>',
        //     to: mailOptions.to,
        //     subject: mailOptions.title,
        //     html: mailOptions.content,
        //     attachment: mailOptions.filePath || ''
        // };
        // transporter.sendMail(data, (err, info) => {
        //     if (err)
        //         return console.error(err);
        //     // console.log('Mail info: ', info);
        // });
    }
}

module.exports = sendEmail;
