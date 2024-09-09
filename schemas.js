///npm i joi 
//joi used for server side error handling

// const joi = require('joi');

const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

// prevent any type of scripting from input
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const joi = BaseJoi.extend(extension)//added extension in joi

module.exports.campgroundSchema = joi.object({
    campground: joi.object({
        title: joi.string().required().escapeHTML(),
        price: joi.number().required().min(0),
        // image: joi.string().required(),
        location: joi.string().required().escapeHTML(),
        description: joi.string().required().escapeHTML()
    }).required(),
    deleteImages:joi.array()
})
 //joi schema-->joi.(type).validator(value)

 //review schema for review validation
 module.exports.reviewSchema = joi.object({
    review: joi.object({
       body:joi.string().required(),
       rating:joi.number().required().min(1).max(5)
    }).required()
})