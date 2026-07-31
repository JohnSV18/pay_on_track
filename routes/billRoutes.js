module.exports = app => {
    const { validate } = require('../middleware/validation.js')
    const noCache = require('../middleware/noCache');
    const requireAuth = require('../middleware/requireAuth');
    const { showCalculator,
            createForm,
            create,
            findAll,
            findBigtoSmall,
            findByTypeCredit,
            findByTypePersonalLoan,
            findOne,
            update,
            updateSettings,
            deleteBill,
            updateForm} = require('../controllers/billController.js')
  
    var router = require("express").Router();
    //Shows interest calculator
    router.get("/calculator", noCache, requireAuth, showCalculator);

    // Shows form to create a new bill
    router.get("/create", noCache, requireAuth, createForm),

    // Create a new Bill
    router.post("/create", requireAuth, validate('bill'), create);

    // Retrieve all Bills
    router.get("/allbills", noCache, requireAuth, findAll);

    // Retrieve sorted bills from lowest amount to largest amount
    router.get("/sortedbills", noCache, requireAuth, findBigtoSmall);

    //Retrieve bills if they are of credit card type
    router.get("/creditbills", noCache, requireAuth, findByTypeCredit);

    //Retrieve bills if they are of personal loan type
    router.get("/personalbills", noCache, requireAuth, findByTypePersonalLoan);

    // Gets the update bill form
    router.get("/bills/update/:id", noCache, requireAuth, updateForm)

    // Retrieve a single bill with id
    router.get("/bills/:id", noCache, requireAuth, findOne);
  
    // Update a bill with id (payment)
    router.put("/bills/:id", requireAuth, update);

    // Update bill settings (APR, min payment, recurring)
    router.patch("/bills/:id/settings", requireAuth, updateSettings);

    // Delete a bill with id
    router.delete("/bills/:id", requireAuth, deleteBill);
  
    // // Delete all bills
    // router.delete("/allbills", bills.deleteAll);
  
    app.use('/', router);
  };
  