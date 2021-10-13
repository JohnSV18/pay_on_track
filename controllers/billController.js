const db = require("../models");
const Bill = db.bills;


// Get to great a new bill form
exports.createForm = (req, res) => {
    res.render("createBill");
}

// Create and Save a new Bill
exports.create = (req, res) => {
    // Validate request
    if (!req.body.title) {
      res.status(400).send({ message: "Content can not be empty!" });
      return;
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
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Bill."
        });
      });
  };

// Retrieve all Bills from the database.
exports.findAll = (req, res) => {
    const title = req.query.title;
    var condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};
  
    Bill.find(condition)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Bill."
        });
      });
  };

// Find a single Bill with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
  
    Bill.findById(id)
      .then(data => {
        if (!data)
          res.status(404).send({ message: "Not found Bill with id " + id });
        else res.send(data);
      })
      .catch(err => {
        res
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
          res.status(404).send({
            message: `Cannot update Bill with id=${id}. Maybe Bill was not found!`
          });
        } else res.send({ message: "Bill was updated successfully." });
      })
      .catch(err => {
        res.status(500).send({
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
          res.status(404).send({
            message: `Cannot delete Bill with id=${id}. Maybe Bill was not found!`
          });
        } else {
          res.send({
            message: "Bill was deleted successfully!"
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Bill with id=" + id
        });
      });
  };

// Delete all Bills from the database.
exports.deleteAll = (req, res) => {
    Bill.deleteMany({})
      .then(data => {
        res.send({
          message: `${data.deletedCount} Bills were deleted successfully!`
        });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all Bills."
        });
      });
  };

