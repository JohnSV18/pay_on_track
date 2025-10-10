module.exports = app => {
    const { validate } = require('../middleware/validation.js')
    const { showCalculator,
            createForm,
            create,
            findAll,
            findBigtoSmall,
            findByTypeCredit,
            findByTypePersonalLoan,
            findOne,
            update,
            deleteBill } = require('../controllers/billController.js')
  
    var router = require("express").Router();
    //Shows interest calculator
    router.get("/calculator", showCalculator);

    // Shows form to create a new bill
    router.get("/create", createForm),

    // Create a new Bill
    router.post("/create", validate('bill'), create);
  
    // Retrieve all Bills
    router.get("/allbills", findAll);

    // Retrieve sorted bills from lowest amount to largest amount
    router.get("/sortedbills", findBigtoSmall);

    //Retrieve bills if they are of credit card type
    router.get("/creditbills", findByTypeCredit);

    //Retrieve bills if they are of personal loan type
    router.get("/personalbills", findByTypePersonalLoan);

    // // Retrieve bills based on sorted dates
    // // router.get("/datedbills", bills.findByDate);

    // Retrieve a single bill with id
    router.get("/bills/:id", findOne);
  
    // Update a bill with id
    router.put("/bills/:id", update);
  
    // Delete a bill with id
    router.delete("/bills/:id", deleteBill);
  
    // // Delete all bills
    // router.delete("/allbills", bills.deleteAll);
  
    app.use('/', router);
  };
  