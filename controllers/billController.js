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
    const currentUser = req.user
    if (!req.body.title) {
      return res.status(400).json({ message: "Content can not be empty!" });
    }
    // Create a Bill
    const bill = new Bill({
      title: req.body.title,
      type: req.body.type,
      description: req.body.description,
      amount: req.body.amount,
      dueDate: req.body.dueDate,
      userId: req.user._id
    });
    await bill.save()
    return res.render('home', { currentUser });
  } catch (error) {
    console.error('Create bill error: ', error.message);
    res.status(500).render('error', { message: 'There was an error and could not create bill'})
  }
}

// Retrieve all Bills from the database.
const findAll = async (req, res) => {
  try{
    const currentUser = req.user;
    if (currentUser) {
      const data = await Bill.find({ userId: req.user._id }).lean()
      return res.render('allBills', { data, currentUser });
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
      return res.status(404).json({ message: "Not found Bill with id " + billId })
    }
    return res.render('showBill', { data, currentUser });
  } catch (error) {
    console.error('Finding bills error: ', error.message);
    res.status(500).render('error', { message: 'There was an error fetching all your bill'})
  }
}

// Update a Bill by the id in the request
const update = async (req, res) => {
  try {
    const currentUser = req.user;
    // console.log(req)
    if (!req.body) {
      return res.status(400).json({
        message: 'Data to update cannot be empty!'
      })
    }
    const billId = req.params.id;
    const data = await Bill.findByIdAndUpdate( billId, req.body, { new: true,  // Returns updated document
                                                                   runValidators: true  // Runs model validators
                                                                  })
    if (!data) {
      return res.status(404).json({
          message: `Cannot update Bill with id=${billId}. Maybe Bill was not found!`
        });
    }
    
    return res.render('home', { currentUser });
  } catch (error) {
    console.error('Updating bill error: ', error.message);
    res.status(500).render('error', { message: 'There was an error updating your bill'})
  }
}

// Delete a Bill with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Bill.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        return res.status(404).send({
          message: `Cannot delete Bill with id=${id}. Maybe Bill was not found!`
        });
      } else {
        return res.render('home');
      }
    })
    .catch(err => {
      return res.status(500).send({
        message: "Could not delete Bill with id=" + id
      });
    });
  };

// Delete all Bills from the database.
exports.deleteAll = (req, res) => {
  Bill.deleteMany({})
    .then(data => {
      return res.send({
        message: `${data.deletedCount} Bills were deleted successfully!`
      });
    })
    .catch(err => {
      return res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Bills."
      });
    });
  };

module.exports = {
  showCalculator,
  createForm,
  create,
  findAll,
  findBigtoSmall,
  findByTypeCredit,
  findByTypePersonalLoan,
  findOne,
  update
};



