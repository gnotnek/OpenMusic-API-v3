const Joi = require('joi');

const UserPayloadSchema = Joi.object({
    username: Joi.string().required().max(50),
    password: Joi.string().required(),
    fullname: Joi.string().required(),
});

module.exports = { UserPayloadSchema };
