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

const sendBillReminderEmail = async (toEmail, billTitle, dueDate, balance) => {
    const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedBalance = Number(balance).toLocaleString('en-US', {
        style: 'currency', currency: 'USD'
    });
    return resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: toEmail,
        subject: `Reminder: "${billTitle}" is due in 3 days`,
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                <div style="background: linear-gradient(135deg, #715AFF 0%, #5887FF 100%); border-radius: 12px; padding: 28px 24px; margin-bottom: 24px; text-align: center;">
                    <h2 style="color: white; margin: 0 0 8px; font-size: 22px;">Payment Reminder</h2>
                    <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 14px;">Pay-On-Track</p>
                </div>
                <p style="font-size: 16px; color: #102E4A;">Hi there,</p>
                <p style="font-size: 16px; color: #102E4A;">This is a reminder that your bill <strong>${billTitle}</strong> is due in <strong>3 days</strong>.</p>
                <div style="background: #f8faff; border: 1.5px solid #e8edf5; border-radius: 10px; padding: 20px; margin: 24px 0;">
                    <p style="margin: 0 0 8px; color: #5a6c7d; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Bill Details</p>
                    <p style="margin: 0 0 6px; color: #102E4A; font-size: 16px;"><strong>${billTitle}</strong></p>
                    <p style="margin: 0 0 6px; color: #5a6c7d; font-size: 14px;">Due: ${formattedDate}</p>
                    <p style="margin: 0; color: #715AFF; font-size: 20px; font-weight: 800;">${formattedBalance}</p>
                </div>
                <p style="color: #666; font-size: 14px;">Log in to Pay-On-Track to make your payment and keep your bills on track.</p>
                <p style="color: #aaa; font-size: 12px; margin-top: 32px;">You received this because you have an active bill in Pay-On-Track.</p>
            </div>
        `
    });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendBillReminderEmail };
