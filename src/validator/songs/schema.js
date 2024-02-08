const Joi = require('joi');

const SongPayloadSchema = Joi.object({
    title: Joi.string().required(),
    year: Joi.number().required().min(1900).max(2024),
    performer: Joi.string().required(),
    genre: Joi.string().required(),
    duration: Joi.number(),
    albumId: Joi.string(),
});

module.exports = { SongPayloadSchema };
