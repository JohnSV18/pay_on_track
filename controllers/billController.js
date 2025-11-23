require('dotenv').config();
const Bill = require("../models/billModel");
// const mailer = require("../utils/mailer")

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
    res.render('createBill', { currentUser });
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
      description: req.body.description,
      originalAmount: req.body.originalAmount,
      currentBalance: req.body.originalAmount,
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

// Retrieve all Bills the user has created in desending order from the last one created
const findAll = async (req, res) => {
  try{
    const currentUser = req.user;
    if (currentUser) {
      const data = await Bill.find({ userId: req.user._id })
            .sort({ createdAt: -1})
            .lean()

      const formattedBills = data.map(bill => ({
        ...bill,
        formattedDate: bill.dueDate.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      })
  );
      return res.render('allBills', { formattedBills, currentUser });
    }
  } catch (error) {
    console.error('Finding all bills error: ', error.message);
    res.status(500).render('error', { message: 'There was an error fetching all your bills'})
  }
}

// Find all bills sorted from highest bill to lowest
const findBigtoSmall = async (req, res) => {
  try {
    const currentUser = req.user;
    if (currentUser) {
      const data = await Bill.find({ userId: req.user._id }).sort({ amount: -1 }).lean()
      return res.render('allBills', { data, currentUser });
    }
  } catch (error) {
    console.error('Finding all bills error: ', error.message);
    res.status(500).render('error', { message: 'There was an error fetching all your bills'})
  }
}

// Find bills sorted by credit card type
const findByTypeCredit = async (req, res) => {
  try {
    const currentUser = req.user;
    if (currentUser) {
      const data = await Bill.find({ 
                            type: 'Credit Card',
                            userId: req.user._id
                          }).lean()
      return res.render('allBills', { data, currentUser });
    }
  } catch (error) {
    console.error('Finding all bills error: ', error.message);
    res.status(500).render('error', { message: 'There was an error fetching all your bills'})
  }
}

// Find bills sorted by credit card type
const findByTypePersonalLoan = async (req, res) => {
  try {
    const currentUser = req.user;
    if (currentUser) {
      const data = await Bill.find({ 
                                type: 'Personal Loan',
                                userId: req.user._id
                              }).lean()
      return res.render('allBills', { data, currentUser })
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
    const data = await Bill.findById(billId).lean()
    if (!data) {
      return res.status(404).json({ message: "Could not find Bill with id " + billId })
    }
    return res.render('showBill', { data, currentUser });
  } catch (error) {
    console.error('Finding bill error: ', error.message);
    res.status(500).render('error', { message: 'There was an error fetching your bill'})
  }
}

// Update a Bill by the id in the request
const update = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!req.body) {
      req.flash('error', 'Data to update cannot be empty!')
      res.redirect('/bills/"id')
    }
    const billId = req.params.id;
    const data = await Bill.findByIdAndUpdate( billId, req.body, { new: true,  // Returns updated document
                                                                   runValidators: true  // Runs model validators
                                                                  })
    if (!data) {
      return res.status(500).render('error', { message: `Cannot update Bill with id=${billId}. Maybe Bill was not found!`})
    };
    return res.render('home', { currentUser });
  } catch (error) {
    console.error('Updating bill error: ', error.message);
    res.status(500).render('error', { message: 'There was an error updating your bill'})
  }
}

// Delete a Bill with the specified id in the request
const deleteBill = async (req, res) => {
  try {
    const currentUser = req.user
    const billId = req.params.id;
    const data = await Bill.findByIdAndRemove(billId)
    if (!data) {
      return res.status(404).json({
        message: `Cannot delete Bill with id=${billId}`
      })
    }
    return res.render('home', { currentUser })
  } catch (error) {
    console.error('Deleting bill error: ', error.message);
    res.status(500).render('error', { message: 'There was an error deleting your bill'})
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
  deleteBill
};



