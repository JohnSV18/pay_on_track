require('dotenv').config();
const Bill = require("../models/billModel");

const formatBills = (bills) => bills.map(bill => ({
  ...bill,
  formattedDate: bill.dueDate.toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
  }),
  paidPercentage: bill.originalAmount > 0
    ? Math.round(((bill.originalAmount - bill.currentBalance) / bill.originalAmount) * 100)
    : 0
}));

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
      billStatus: req.body.billStatus,
      payments: req.body.payments,
      userId: req.user._id
    });
    await bill.save()
    console.log(bill)
    return res.redirect('/allbills')
  } catch (error) {
    console.error('Create bill error: ', error.message);
    res.status(500).render('error', { message: 'There was an error and could not create bill'})
  }
}

// Retrieve all Bills — optionally filtered by ?type=
const findAll = async (req, res) => {
  try{
    const currentUser = req.user;
    if (currentUser) {
      const query = { userId: req.user._id };
      if (req.query.type) query.type = req.query.type;

      const data = await Bill.find(query).sort({ createdAt: -1 }).lean();
      const formattedBills = formatBills(data);
      return res.render('allBills', { formattedBills, currentUser, activeFilter: req.query.type || null });
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
    const currentUser = req.user
    const bill = await Bill.findById(billId).lean()
    if (!bill) {
      return res.status(404).json({ message: "Could not find Bill with id " + billId })
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
    const bill = await Bill.findById(billId).lean();
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
    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).render('error', { pageTitle: 'Not Found', statusCode: 404, message: 'Bill not found.' });
    }

    const paymentAmount = parseFloat(req.body.paymentAmount);
    if (!paymentAmount || paymentAmount <= 0) {
      req.flash('error', 'Please enter a valid payment amount.');
      return res.redirect(`/bills/update/${billId}`);
    }

    const newBalance = Math.max(0, parseFloat((bill.currentBalance - paymentAmount).toFixed(2)));

    const updateData = {
      currentBalance: newBalance,
      billStatus: newBalance <= 0 ? 'paid' : 'active',
      $push: { payments: { paymentAmount, paymentDate: new Date() } }
    };

    if (req.body.interestRate !== '' && req.body.interestRate != null) {
      updateData.interestRate = parseFloat(req.body.interestRate);
    }
    if (req.body.minimumPayment !== '' && req.body.minimumPayment != null) {
      updateData.minimumPayment = parseFloat(req.body.minimumPayment);
    }

    await Bill.findByIdAndUpdate(billId, updateData, { new: true, runValidators: true });

    req.flash('success', `Payment of $${paymentAmount.toFixed(2)} applied.`);
    return res.redirect(`/bills/${billId}`);
  } catch (error) {
    console.error('Updating bill error: ', error.message);
    res.status(500).render('error', { message: 'There was an error updating your bill' });
  }
}

// Updating current balance by making a payment

// Delete a Bill with the specified id in the request
const deleteBill = async (req, res) => {
  try {
    const billId = req.params.id;
    const deleted = await Bill.findByIdAndDelete(billId);
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
  updateForm,
  deleteBill
};



