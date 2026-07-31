const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (toEmail, code) => {
    return resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: toEmail,
        subject: 'Verify your Pay-On-Track email',
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                <h2>Verify your email</h2>
                <p>Enter this code to complete your Pay-On-Track sign up:</p>
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; padding: 16px 0;">${code}</div>
                <p style="color: #666;">This code expires in 15 minutes.</p>
                <p style="color: #666;">If you didn't create an account, you can ignore this email.</p>
            </div>
        `
    });
};

const sendPasswordResetEmail = async (toEmail, resetUrl) => {
    return resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: toEmail,
        subject: 'Reset your Pay-On-Track password',
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                <h2>Reset your password</h2>
                <p>Click the button below to reset your Pay-On-Track password. This link expires in 1 hour.</p>
                <a href="${resetUrl}" style="display: inline-block; background-color: #0d6efd; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 16px 0;">Reset Password</a>
                <p style="color: #666;">Or copy and paste this link into your browser:</p>
                <p style="color: #666; word-break: break-all;">${resetUrl}</p>
                <p style="color: #666;">If you didn't request a password reset, you can ignore this email.</p>
            </div>
        `
    });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
