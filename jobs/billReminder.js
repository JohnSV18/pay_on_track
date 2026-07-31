const cron = require('node-cron');
const { sendDueReminders } = require('../services/reminderService');

// Runs every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
    console.log('Running bill reminder job...');
    try {
        await sendDueReminders();
    } catch (err) {
        console.error('Bill reminder job error:', err.message);
    }
});
