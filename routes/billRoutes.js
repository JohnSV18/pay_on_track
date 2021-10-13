module.exports = app => {
    const bills = require("../controllers/billController.js");
  
    var router = require("express").Router();

    // Get to create a new bill form
    router.get("/create", bills.createForm),
  
    // Create a new Bill
    router.post("/create", bills.create);
  
    // Retrieve all Bills
    router.get("/", bills.findAll);
  
    // Retrieve a single bill with id
    router.get("/:id", bills.findOne);
  
    // Update a bill with id
    router.put("/:id", bills.update);
  
    // Delete a bill with id
    router.delete("/:id", bills.delete);
  
    // Delet all bills
    router.delete("/", bills.deleteAll);
  
    app.use('/bills', router);
  };
  