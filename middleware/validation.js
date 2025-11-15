const Joi = require('joi')

const schemas = {
    bill: Joi.object({
        title: Joi.string().min(1).max(100).required().messages({
            'string.empty': 'Bill name is required',
            'string.min': 'Bill name must be at least 1 character',
            'string.max': 'Bill name cannot exceed 100 characters',
            'any.required': 'Bill name is required'
        }),
        type: Joi.string().min(1).max(100).required().messages({
            'string.empty': 'Bill type is required',
            'any.required': 'Bill type is required'  
        }),
        description: Joi.string().min(1).max(100).required().messages({
            'string.empty': 'Bill description is required',
            'any.required': 'Bill description is required'
        }),
        amount: Joi.number().positive().max(999999.99).precision(2).required().messages({
            'number.base': 'Amount must be a valid number',
            'number.positive': 'Amount must be greater than 0',
            'number.max': 'Amount cannot exceed $999,999.99',
            'any.required': 'Bill amount is required'
        }),
        dueDate: Joi.date().required().messages({
            'date.base': 'Please enter a valid date',
            'any.required': 'Due date is required'
        }),
        // dateCreated: Joi.date().required().messages({
        //     'date.base': 'Could not add date created',
        //     'any.required': 'Date Created is required'
        // }),
    }),
    user: Joi.object({
        username: Joi.string().min(1).max(10).required().messages({
            'string.empty': 'Username is required',
            'string.min': 'Username must be at least 3 characters',
            'string.max': 'Username cannot exceed 10 characters',
            'any.required': 'Username is required'
        }),
        // email: Joi.string().email().required(),
        password: Joi.string().min(6).required().messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 6 characters',
            'any.required': 'Password is required'
        }),
        passwordVerify: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Please confirm your password',
            'string.empty': 'Please confirm your password'
      })
    }),
    login: Joi.object({
        username: Joi.string().min(1).max(100).required().messages({
            'string.empty': 'Username is required',
            'any.required': 'Username is required'
        }),
        password: Joi.string().required().messages({
            'string.empty': 'Password is required',
            'any.required': 'Password is required'
        })
    })
};

const routeRedirects = {
    'user': '/signup',
    'login': '/login',
    'bill': '/create'
};

const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        const { error, value, warning } = schema.validate(req.body);
        if (error) {
             // Get the first error message
            const errorMessage = error.details[0].message;
            
            // Set flash message
            req.flash('error', errorMessage);
            
            // Get the redirect path for this schema
            const redirectPath = routeRedirects[schemaName] || '/';
            
            return res.redirect(redirectPath);
        }
        req.body = value;

        if (warning) {
            req.validationWarning = warning.details;
        }
        next();
    };
};

module.exports = { validate };