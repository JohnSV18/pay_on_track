module.exports = app => {
    const { validate } = require('../middleware/validation.js')
    const { showCalculator,
            createForm,
            create,
            findAll } = require('../controllers/billController.js')
    // const bills = require("../controllers/billController.js");
  
    var router = require("express").Router();
    //Shows interest calculator
    router.get("/calculator", showCalculator);

    // Shows form to create a new bill
    router.get("/create", createForm),

    // Create a new Bill
    router.post("/create", validate('bill'), create);
  
    // Retrieve all Bills
    router.get("/allbills", findAll);

    // // Retrieve sorted bills from lowest amount to largest amount
    // router.get("/sortedbills", bills.findBigtoSmall);

    // //Retrieve bills if they are of credit card type
    // router.get("/creditbills", bills.findByTypeCredit);

    // //Retrieve bills if they are of personal loan type
    // router.get("/personalbills", bills.findByTypePersonalLoan);

    // // Retrieve bills based on sorted dates
    // // router.get("/datedbills", bills.findByDate);

    // // Retrieve a single bill with id
    // router.get("/bills/:id", bills.findOne);
  
    // // Update a bill with id
    // router.put("/bills/:id", bills.update);
  
    // // Delete a bill with id
    // router.delete("/bills/:id", bills.delete);
  
    // // Delete all bills
    // router.delete("/allbills", bills.deleteAll);
  
    app.use('/', router);
  };
  