
require('dotenv').config();
const mailer = require("../utils/mailer")
const Bill = require("../models/billModel");

// Get to great a new bill form
exports.createForm = (req, res) => {
    const currentUser = req.user;
    res.render("createBill", { currentUser });
}
// Create and Save a new Bill
exports.create = (req, res) => {
    // Validate request
    const currentUser = req.user;
    if (!req.body.title) {
      return res.status(400).send({ message: "Content can not be empty!" });
    
    }
    // Create a Bill
    const bill = new Bill({
      title: req.body.title,
      description: req.body.description,
      amount: req.body.amount,
      due_date: req.body.due_date,
    });
    
    // Save Bill in the database
    bill
      .save(bill)
      .then(data => {
        mailer.sendMail(bill);
        return res.redirect(`/`, { currentUser });
      })
      .catch(err => {
        return res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Bill."
        });
      });
    
  };

// Retrieve all Bills from the database.
exports.findAll = (req, res) => {
    const currentUser = req.user;
    if(currentUser){
      const title = req.query.title;
      var condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};
    
      Bill.find(condition).lean()
        .then(data => {
          return res.render('allBills', { data , currentUser });
        })
        .catch(err => {
          return res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving Bill."
          });
        });
    } else {
      return res.status(401); // Unauthorized
    }
   
  };

// Find a single Bill with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
    const currentUser = req.user;
  
    Bill.findById(id).lean()
      .then(data => {
        if (!data)
          return res.status(404).send({ message: "Not found Bill with id " + id });
        else return res.render('showBill', { data , currentUser });
      })
      .catch(err => {
        return res
          .status(500)
          .send({ message: "Error retrieving Bill with id=" + id });
      });
  };

// Update a Bill by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!"
      });
    }
  
    const id = req.params.id;
  
    Bill.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
      .then(data => {
        if (!data) {
          return res.status(404).send({
            message: `Cannot update Bill with id=${id}. Maybe Bill was not found!`
          });
        } else return res.render('home');
      })
      .catch(err => {
        return res.status(500).send({
          message: "Error updating Bill with id=" + id
        });
      });
  };

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



