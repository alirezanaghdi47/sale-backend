// libraries
const path = require("path");
const hbs = require('nodemailer-express-handlebars');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    tls: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    }
});

const handlebarOptions = {
    viewEngine: {
        partialsDir: path.resolve('src','views'),
        defaultLayout: false,
    },
    viewPath: path.resolve('src','views'),
};

transporter.use('compile', hbs(handlebarOptions));

module.exports = {
    transporter
}