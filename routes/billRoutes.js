module.exports = app => {
    const bills = require("../controllers/billController.js");
    // const auth = require("../middleware/auth")
  
    var router = require("express").Router();
  
    // Shows form to create a new bill
    router.get("/create", bills.createForm),
    // Create a new Bill
    router.post("/create", bills.create);
  
    // Retrieve all Bills
    router.get("/allbills", bills.findAll);
  
    // Retrieve a single bill with id
    router.get("/bills/:id", bills.findOne);
  
    // Update a bill with id
    router.put("/bills/:id", bills.update);
  
    // Delete a bill with id
    router.delete("/bills/:id", bills.delete);
  
    // Delete all bills
    router.delete("/allbills", bills.deleteAll);
  
    app.use('/', router);
  };
  