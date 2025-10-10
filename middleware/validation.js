const Joi = require('joi')

const schemas = {
    bill: Joi.object({
        title: Joi.string().min(1).max(100).required(),
        type: Joi.string().min(1).max(100).required(),
        description: Joi.string().min(1).max(100).required(),
        amount: Joi.number().positive().max(999999.99).precision(2).required(),
        dueDate: Joi.date().required(),
    }),
    user: Joi.object({
        username: Joi.string().min(1).max(100).required(),
        // email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        passwordVerify: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Passwords do not match'
      })
    }),
    login: Joi.object({
        username: Joi.string().min(1).max(100).required(),
        password: Joi.string().required()
    })
};

const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        const { error, value, warning } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(detail => detail.message)

            });
        }
        req.body = value;

        if (warning) {
            req.validationWarning = warning.details;s
        }
        next();
    };
};

module.exports = { validate };