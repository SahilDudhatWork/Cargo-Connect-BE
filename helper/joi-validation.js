const Joi = require("joi");
const { ObjectId } = require("mongoose").Types;

/**
 * validating options for Joi
 */
const options = {
  abortEarly: false,
};

const email = (value, helper) => {
  const domain = value.split("@");
  if (domain[1] === `yopmail.com`) {
    return helper.error("any.invalid");
  }
  return value;
};

const passwordSchema = Joi.string()
  .empty()
  .required()
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {
    name: "required",
  })
  .message(
    `Enter a password with minimum one upper case, lower case and number, ranging from 8-15 characters`
  )
  .min(8)
  .max(15)
  .messages({
    "string.base": `Enter a password with minimum one upper case, lower case and number, ranging from 8-15 characters`,
    "string.empty": `Password is required`,
    "string.min": `Password must have a minimum of {#limit} characters`,
    "string.max": `Password can have a maximum of {#limit} characters`,
    "any.required": `Password is required`,
  });

const mobileSchema = Joi.number()
  .integer()
  .empty()
  .min(1000000000)
  .max(9999999999)
  .required()
  .messages({
    "number.base": `Mobile number must be a number`,
    "number.empty": `Mobile number is required`,
    "number.integer": `Mobile number must be an integer`,
    "number.min": `Mobile number must be at least 10 digits long`,
    "number.max": `Mobile number cannot exceed 10 digits`,
    "any.required": `Mobile number is required`,
  });

const fullNameSchema = Joi.string().empty().max(150).messages({
  "string.base": `fullName must be a type of string`,
  "string.empty": `fullName is required `,
  "string.max": `fullName can have maximum  of {#limit} characters`,
  "any.required": `fullName is required `,
  "any.optional": `fullName is optional `,
});

const emailSchema = Joi.string()
  .empty()
  .custom(email, "custom validation")
  .message("Invalid Email")
  .email({ tlds: { allow: true } })
  .max(256)
  .required()
  .messages({
    "string.base": `Enter your email address in format: yourname@example.com`,
    "string.email": `Enter your email address in format: yourname@example.com`,

    "string.empty": `Email is required`,
    "string.min": `Email must have minimum of {#limit} characters`,
    "string.max": `Email can have maximum of {#limit} characters`,
    "any.required": `Email is required`,
    "any.invalid": `Invalid Email`,
  });
const emailPasswordSchema = Joi.object()
  .keys({
    email: emailSchema,
    password: passwordSchema,
  })
  .unknown(true);

const emailVerifySchema = Joi.object().keys({
  otp: Joi.string().empty().messages({
    "string.base": `otp must be a type of string`,
    "string.empty": `otp is required`,
    "string.min": `otp must have minimum of {#limit} characters`,
    "string.max": `otp can have maximum  of {#limit} characters`,
    "any.required": `otp is required`,
    "any.optional": `otp is optional`,
  }),
  email: emailSchema,
});

const emailVerify = Joi.object().keys({
  email: emailSchema,
});

const loginWithEmailSchema = Joi.object()
  .keys({
    email: emailSchema,
    password: passwordSchema,
  })
  .unknown(true);

const GoogleSchema = Joi.object().keys({
  tokenId: Joi.string().empty().required().messages({
    "string.base": `token must be a type of string`,
    "string.empty": `token is required `,
    "string.min": `token must have minimum of {#limit} characters`,
    "string.max": `token can have maximum  of {#limit} characters`,
    "any.required": `token is required `,
    "any.optional": `token is optional `,
  }),
});

// Function

const emailAndPasswordVerification = (data) => {
  return emailPasswordSchema.validate(data, options);
};

const registerWithEmail = (data) => {
  return emailPasswordSchema.validate(data, options);
};
const tokenVerification = (data) => {
  return emailVerifySchema.validate(data, options);
};
const emailVerification = (data) => {
  return emailVerify.validate(data, options);
};
const adminLogin = (data) => {
  return loginWithEmailSchema.validate(data, options);
};

const mobileVerification = (data) => {
  return mobileSchema.validate(data.mobile, options);
};
const validateResetPassword = (data) => {
  return passwordSchema.validate(data.password, options);
};

const google = (data) => {
  return GoogleSchema.validate(data, options);
};

// check Email Or Mobile
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^[0-9]+$/;
  return phoneRegex.test(phoneNumber);
};

module.exports = {
  emailAndPasswordVerification,
  registerWithEmail,
  tokenVerification,
  emailVerification,
  validateResetPassword,
  google,
  mobileVerification,
  adminLogin,
};
