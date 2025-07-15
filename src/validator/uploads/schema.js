const Joi = require('joi');

const CoverHeadersSchema = Joi.object({
  'content-type': Joi.string().valid('image/jpeg', 'image/png', 'image/jpg').required(),
}).unknown();
