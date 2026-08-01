const chai = require('chai');
const { describe, it, before, after } = require('mocha');
const expect = chai.expect;

// ─── Mock Setup ───────────────────────────────────────────────────────────────
// Inject a fake Resend module into Node's require cache BEFORE loading
// emailService, so no real emails are ever sent during tests.

const sentEmails = [];
let mockShouldFail = false;

const mockResendModule = {
    Resend: class MockResend {
        get emails() {
            return {
                send: async (payload) => {
                    if (mockShouldFail) {
                        return { data: null, error: { name: 'api_error', message: 'Invalid API Key' } };
                    }
                    sentEmails.push(payload);
                    return { data: { id: `mock-id-${Date.now()}` }, error: null };
                }
            };
        }
    }
};

// Override require cache for the resend package
require.cache[require.resolve('resend')] = {
    id: require.resolve('resend'),
    filename: require.resolve('resend'),
    loaded: true,
    exports: mockResendModule
};

// Now load emailService — it will pick up the mock Resend above
const emailService = require('../services/emailService');

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Email Service', function () {

    before(function () {
        process.env.RESEND_FROM_EMAIL = 'noreply@pay-on-track.com';
        process.env.RESEND_API_KEY = 'test-key';
    });

    after(function () {
        // Restore real resend module
        delete require.cache[require.resolve('resend')];
    });

    // ─── Verification Email ───────────────────────────────────────────────

    describe('sendVerificationEmail()', function () {

        it('should send to a Gmail address without error', async function () {
            const result = await emailService.sendVerificationEmail('user@gmail.com', '123456');
            expect(result.error).to.be.null;
            expect(result.data.id).to.exist;
        });

        it('should send to an Outlook address without error', async function () {
            const result = await emailService.sendVerificationEmail('user@outlook.com', '234567');
            expect(result.error).to.be.null;
        });

        it('should send to a Yahoo address without error', async function () {
            const result = await emailService.sendVerificationEmail('user@yahoo.com', '345678');
            expect(result.error).to.be.null;
        });

        it('should send to a custom domain address without error', async function () {
            const result = await emailService.sendVerificationEmail('user@company.com', '456789');
            expect(result.error).to.be.null;
        });

        it('should include the 6-digit code in the email body', async function () {
            sentEmails.length = 0;
            await emailService.sendVerificationEmail('user@gmail.com', '998877');
            const lastEmail = sentEmails[sentEmails.length - 1];
            expect(lastEmail.html).to.include('998877');
        });

        it('should use the correct subject line', async function () {
            sentEmails.length = 0;
            await emailService.sendVerificationEmail('user@gmail.com', '111111');
            const lastEmail = sentEmails[sentEmails.length - 1];
            expect(lastEmail.subject).to.include('Verify');
        });

        it('should return the error object when Resend fails', async function () {
            mockShouldFail = true;
            const result = await emailService.sendVerificationEmail('user@gmail.com', '000000');
            expect(result.error).to.exist;
            expect(result.error.message).to.equal('Invalid API Key');
            mockShouldFail = false;
        });

    });

    // ─── Password Reset Email ─────────────────────────────────────────────

    describe('sendPasswordResetEmail()', function () {

        const resetUrl = 'https://pay-on-track.com/reset-password/abc123token';

        it('should send to a Gmail address without error', async function () {
            const result = await emailService.sendPasswordResetEmail('user@gmail.com', resetUrl);
            expect(result.error).to.be.null;
        });

        it('should send to an Outlook address without error', async function () {
            const result = await emailService.sendPasswordResetEmail('user@outlook.com', resetUrl);
            expect(result.error).to.be.null;
        });

        it('should send to a custom domain address without error', async function () {
            const result = await emailService.sendPasswordResetEmail('admin@company.org', resetUrl);
            expect(result.error).to.be.null;
        });

        it('should include the reset URL in the email body', async function () {
            sentEmails.length = 0;
            await emailService.sendPasswordResetEmail('user@gmail.com', resetUrl);
            const lastEmail = sentEmails[sentEmails.length - 1];
            expect(lastEmail.html).to.include(resetUrl);
        });

        it('should use the correct subject line', async function () {
            sentEmails.length = 0;
            await emailService.sendPasswordResetEmail('user@gmail.com', resetUrl);
            const lastEmail = sentEmails[sentEmails.length - 1];
            expect(lastEmail.subject).to.include('Reset');
        });

    });

    // ─── Bill Reminder Email ──────────────────────────────────────────────

    describe('sendBillReminderEmail()', function () {

        it('should send to a Gmail address without error', async function () {
            const result = await emailService.sendBillReminderEmail(
                'user@gmail.com', 'Best Buy Credit Card', new Date('2026-08-03'), 250.00
            );
            expect(result.error).to.be.null;
        });

        it('should send to an Outlook address without error', async function () {
            const result = await emailService.sendBillReminderEmail(
                'user@outlook.com', 'Rent', new Date('2026-08-03'), 1500.00
            );
            expect(result.error).to.be.null;
        });

        it('should send to a Yahoo address without error', async function () {
            const result = await emailService.sendBillReminderEmail(
                'user@yahoo.com', 'Car Insurance', new Date('2026-08-03'), 89.99
            );
            expect(result.error).to.be.null;
        });

        it('should handle a $0 balance without error', async function () {
            const result = await emailService.sendBillReminderEmail(
                'user@gmail.com', 'Netflix', new Date('2026-08-03'), 0
            );
            expect(result.error).to.be.null;
        });

        it('should handle a large balance without error', async function () {
            const result = await emailService.sendBillReminderEmail(
                'user@gmail.com', 'Mortgage', new Date('2026-08-03'), 999999.99
            );
            expect(result.error).to.be.null;
        });

        it('should include the bill name in the email body', async function () {
            sentEmails.length = 0;
            await emailService.sendBillReminderEmail(
                'user@gmail.com', 'Best Buy Credit Card', new Date('2026-08-03'), 250.00
            );
            const lastEmail = sentEmails[sentEmails.length - 1];
            expect(lastEmail.html).to.include('Best Buy Credit Card');
        });

        it('should format the balance as currency in the email body', async function () {
            sentEmails.length = 0;
            await emailService.sendBillReminderEmail(
                'user@gmail.com', 'Rent', new Date('2026-08-03'), 1500.00
            );
            const lastEmail = sentEmails[sentEmails.length - 1];
            expect(lastEmail.html).to.include('$1,500.00');
        });

    });

});
