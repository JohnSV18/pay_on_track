require('dotenv').config();
const Bill = require("../models/billModel");

const formatBills = (bills) => bills.map(bill => {
  const now = new Date();
  const due = new Date(bill.dueDate);
  const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  let urgencyLevel = 'low';
  if (daysUntilDue <= 3) urgencyLevel = 'high';
  else if (daysUntilDue <= 7) urgencyLevel = 'medium';

  return {
    ...bill,
    formattedDate: due.toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
    }),
    shortDate: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    paidPercentage: bill.originalAmount > 0
      ? Math.round(((bill.originalAmount - bill.currentBalance) / bill.originalAmount) * 100)
      : 0,
    daysUntilDue,
    urgencyLevel
  };
});

// takes you to the interest calculator page
const showCalculator = (req, res) => {
  try{
    const currentUser = req.user;
    res.render('interestCalculator', { currentUser });
  } catch (error) {
    console.error('Calculator page error: ', error.message);
    res.status(500).render('error', { message: 'Error showing the calculator' });
  }
}
//takes you to the create bill page
const createForm = (req, res) => {
  try{
    const currentUser = req.user;
    const today = new Date().toISOString().split('T')[0];
    res.render('createBill', { currentUser, today });
  } catch (error) {
    console.error('Create bill error: ', error.message);
    res.status(500).render('error', { message: 'Error on loading page'})
  }
}

// creates a bill and saves it based on the userID
const create = async (req, res) => {
  try{
    // const currentUser = req.user
    if (!req.body.title) {
      req.flash('error', 'Content can not be empty!')
      return res.redirect('/create');
    }
    // Create a Bill
    const bill = new Bill({
      title: req.body.title,
      type: req.body.type,
      originalAmount: req.body.originalAmount,
      currentBalance: req.body.originalAmount,
      interestRate: req.body.interestRate || undefined,
      minimumPayment: req.body.minimumPayment || undefined,
      dueDate: req.body.dueDate,
      isRecurring: !!req.body.isRecurring,
      userId: req.user._id
    });
    await bill.save();
    return res.redirect('/allbills');
  } catch (error) {
    console.error('Create bill error: ', error.message);
    res.status(500).render('error', { message: 'There was an error and could not create bill'})
  }
}

// Retrieve all Bills — optionally filtered by ?type= and sorted by ?sort=desc|asc|date
const findAll = async (req, res) => {
  try{
    const currentUser = req.user;
    if (currentUser) {
      const query = { userId: req.user._id };
      if (req.query.type) query.type = req.query.type;

      let mongoSort = { currentBalance: -1 };
      let currentSort = 'desc';
      if (req.query.sort === 'asc') {
        mongoSort = { currentBalance: 1 };
        currentSort = 'asc';
      } else if (req.query.sort === 'date') {
        mongoSort = { dueDate: 1 };
        currentSort = 'date';
      }

      const data = await Bill.find(query).sort(mongoSort).lean();
      const formattedBills = formatBills(data);

      const totalBalance = data.reduce((sum, b) => sum + (b.currentBalance || 0), 0);
      const totalMinPayment = data.reduce((sum, b) => sum + (b.minimumPayment || 0), 0);

      const sortLabels = { desc: 'Highest Balance', asc: 'Lowest Balance', date: 'Due Date' };
      const activeFilter = req.query.type || null;
      const typeParam = activeFilter ? `&type=${encodeURIComponent(activeFilter)}` : '';

      return res.render('allBills', {
        formattedBills,
        currentUser,
        activeFilter,
        currentSort,
        sortLabel: sortLabels[currentSort],
        sortIsDesc: currentSort === 'desc',
        sortIsAsc: currentSort === 'asc',
        sortIsDate: currentSort === 'date',
        sortLinkDesc: `/allbills?sort=desc${typeParam}`,
        sortLinkAsc: `/allbills?sort=asc${typeParam}`,
        sortLinkDate: `/allbills?sort=date${typeParam}`,
        totalBalance: totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        totalMinPayment: totalMinPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      });
    }
  } catch (error) {
    console.error('Finding all bills error: ', error.message);
    res.status(500).render('error', { message: 'There was an error fetching all your bills'})
  }
}

// Find all bills sorted from highest balance to lowest
const findBigtoSmall = async (req, res) => {
  try {
    const currentUser = req.user;
    if (currentUser) {
      const data = await Bill.find({ userId: req.user._id }).sort({ currentBalance: -1 }).lean();
      const formattedBills = formatBills(data);
      return res.render('allBills', { formattedBills, currentUser });
    }
  } catch (error) {
    console.error('Finding all bills error: ', error.message);
    res.status(500).render('error', { message: 'There was an error fetching all your bills'})
  }
}

// Find bills by Credit Card type
const findByTypeCredit = async (req, res) => {
  try {
    const currentUser = req.user;
    if (currentUser) {
      const data = await Bill.find({ type: 'Credit Card', userId: req.user._id }).lean();
      const formattedBills = formatBills(data);
      return res.render('allBills', { formattedBills, currentUser });
    }
  } catch (error) {
    console.error('Finding all bills error: ', error.message);
    res.status(500).render('error', { message: 'There was an error fetching all your bills'})
  }
}

// Find bills by Loan type
const findByTypePersonalLoan = async (req, res) => {
  try {
    const currentUser = req.user;
    if (currentUser) {
      const data = await Bill.find({ type: 'Loan', userId: req.user._id }).lean();
      const formattedBills = formatBills(data);
      return res.render('allBills', { formattedBills, currentUser });
    }
  } catch (error) {
    console.error('Finding all bills error: ', error.message);
    res.status(500).render('error', { message: 'There was an error fetching all your bills'})
  }
}


// Find a bill from oldest oldest due date to newest
// exports.findByDate = (req, res) => {
//   const currentUser = req.user;
//   if(currentUser){
//     Bill.find({due_date:{$gte: ISODate("2022-01-13"), $lt:ISODate("2021-01-01")}}).lean()
//     .then(data => {
//       return res.render('allBills', { data , currentUser });
//     })
//     .catch(err => {
//       return res.status(500).send({
//         message:
//           err.message || "Some error occurred while retrieving Bills."
//       });
//     })
//   }
// }


// // Find a single Bill with an id
const findOne = async (req, res) => {
  try {
    const billId = req.params.id;
    const currentUser = req.user;
    const bill = await Bill.findOne({ _id: billId, userId: req.user._id }).lean();
    if (!bill) {
      return res.status(404).render('error', { pageTitle: 'Not Found', statusCode: 404, message: 'Bill not found.' });
    }
    const data = {
      ...bill,
      formattedDate: bill.dueDate.toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
      }),
      paidPercentage: bill.originalAmount > 0
        ? Math.round(((bill.originalAmount - bill.currentBalance) / bill.originalAmount) * 100)
        : 0,
      payments: bill.payments.map(p => {
        const d = new Date(p.paymentDate);
        const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return { ...p, paymentDate: `${date} · ${time}` };
      })
    };
    return res.render('showBill', { data, currentUser });
  } catch (error) {
    console.error('Finding bill error: ', error.message);
    res.status(500).render('error', { message: 'There was an error fetching your bill'})
  }
}

const updateForm = async (req, res) => {
  try {
    const billId = req.params.id;
    const currentUser = req.user;
    const bill = await Bill.findOne({ _id: billId, userId: req.user._id }).lean();
    if (!bill) {
      return res.status(404).render('error', { pageTitle: 'Not Found', statusCode: 404, message: 'Bill not found.' });
    }
    const data = {
      ...bill,
      formattedDate: bill.dueDate.toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
      })
    };
    return res.render('updateBill', { data, currentUser });
  } catch (error){
    console.error('Finding bill error: ', error.message);
    res.status(500).render('error', { message: 'There was an error fetching your bill' });
  }
}

// Apply a payment: subtracts paymentAmount from currentBalance and logs it
const update = async (req, res) => {
  try {
    const billId = req.params.id;
    const bill = await Bill.findOne({ _id: billId, userId: req.user._id });
    if (!bill) {
      return res.status(404).render('error', { pageTitle: 'Not Found', statusCode: 404, message: 'Bill not found.' });
    }

    const paymentAmount = parseFloat(req.body.paymentAmount);
    if (!paymentAmount || paymentAmount <= 0) {
      req.flash('error', 'Please enter a valid payment amount.');
      return res.redirect(`/bills/update/${billId}`);
    }

    const newBalance = Math.max(0, parseFloat((bill.currentBalance - paymentAmount).toFixed(2)));

    let finalBalance = newBalance;
    let finalStatus = newBalance <= 0 ? 'paid' : 'active';
    let finalDueDate = bill.dueDate;

    if (bill.isRecurring && newBalance <= 0) {
      finalBalance = bill.originalAmount;
      finalStatus = 'active';
      const nextDue = new Date(bill.dueDate);
      nextDue.setMonth(nextDue.getMonth() + 1);
      finalDueDate = nextDue;
    }

    const updateData = {
      currentBalance: finalBalance,
      billStatus: finalStatus,
      dueDate: finalDueDate,
      $push: { payments: { paymentAmount, paymentDate: new Date() } }
    };

    await Bill.findByIdAndUpdate(billId, updateData, { new: true, runValidators: true });

    const recurringMsg = bill.isRecurring && newBalance <= 0 ? ' Bill reset for next month.' : '';
    req.flash('success', `Payment of $${paymentAmount.toFixed(2)} applied.${recurringMsg}`);
    return res.redirect(`/bills/${billId}`);
  } catch (error) {
    console.error('Updating bill error: ', error.message);
    res.status(500).render('error', { message: 'There was an error updating your bill' });
  }
}

// Updating current balance by making a payment

// Update bill settings (APR, min payment, recurring) independently of payments
const updateSettings = async (req, res) => {
  try {
    const billId = req.params.id;
    const bill = await Bill.findOne({ _id: billId, userId: req.user._id });
    if (!bill) {
      return res.status(404).render('error', { pageTitle: 'Not Found', statusCode: 404, message: 'Bill not found.' });
    }

    const settingsData = {
      isRecurring: req.body.isRecurring === 'on' || req.body.isRecurring === true
    };
    if (req.body.interestRate !== '' && req.body.interestRate != null) {
      settingsData.interestRate = parseFloat(req.body.interestRate);
    } else {
      settingsData.interestRate = undefined;
    }
    if (req.body.minimumPayment !== '' && req.body.minimumPayment != null) {
      settingsData.minimumPayment = parseFloat(req.body.minimumPayment);
    } else {
      settingsData.minimumPayment = undefined;
    }

    await Bill.findByIdAndUpdate(billId, settingsData, { new: true, runValidators: true });

    req.flash('success', 'Bill settings updated.');
    return res.redirect(`/bills/update/${billId}`);
  } catch (error) {
    console.error('Updating bill settings error: ', error.message);
    res.status(500).render('error', { message: 'There was an error updating your bill settings' });
  }
};

// Delete a Bill with the specified id in the request
const deleteBill = async (req, res) => {
  try {
    const billId = req.params.id;
    const deleted = await Bill.findOneAndDelete({ _id: billId, userId: req.user._id });
    if (!deleted) {
      return res.status(404).render('error', { pageTitle: 'Not Found', statusCode: 404, message: 'Bill not found.' });
    }
    req.flash('success', 'Bill deleted successfully.');
    return res.redirect('/allbills');
  } catch (error) {
    console.error('Deleting bill error: ', error.message);
    res.status(500).render('error', { message: 'There was an error deleting your bill' });
  }
}

// Delete all Bills from the database.
const deleteAll = async (req, res) => {
  try{
    await Bill.deleteMany({})
    console.log('All bills were deleted')
    return res.render('home')
  } catch (error) {
    console.error('Deleting all bills error: ', error.message);
    res.status(500).render('error', { message: 'There was an error deleting all your bills'})
  }
}

module.exports = {
  showCalculator,
  createForm,
  create,
  findAll,
  findBigtoSmall,
  findByTypeCredit,
  findByTypePersonalLoan,
  findOne,
  update,
  updateSettings,
  updateForm,
  deleteBill
};



