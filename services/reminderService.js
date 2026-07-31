const Bill = require('../models/billModel');
const User = require('../models/userModel');
const { sendBillReminderEmail } = require('./emailService');

const sendDueReminders = async () => {
    const now = new Date();

    // Use UTC dates to match how HTML date inputs are stored (UTC midnight)
    const targetStart = new Date(Date.UTC(
        now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 3
    ));
    const targetEnd = new Date(Date.UTC(
        now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 3,
        23, 59, 59, 999
    ));

    const bills = await Bill.find({
        billStatus: 'active',
        dueDate: { $gte: targetStart, $lte: targetEnd }
    }).lean();

    console.log(`Bill reminders: found ${bills.length} bill(s) due on ${targetStart.toDateString()}`);

    for (const bill of bills) {
        const user = await User.findById(bill.userId).lean();
        if (user?.email) {
            await sendBillReminderEmail(user.email, bill.title, bill.dueDate, bill.currentBalance);
            console.log(`Reminder sent to ${user.email} for bill "${bill.title}"`);
        }
    }
};

module.exports = { sendDueReminders };
