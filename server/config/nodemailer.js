import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
    host:'smtp-relay.brevo.com',
    port: 2525,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,   // 10 seconds
    socketTimeout: 10000      // 10 seconds
});
export default transporter;