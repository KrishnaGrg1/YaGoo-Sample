import Joi from 'joi';

const userValidation = {
  register: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Invalid email format',
      }),

      fullname: Joi.string().min(3).required().messages({
        'any.required': 'Fullname is required',
      }),

      password: Joi.string().min(6).required().messages({
        'any.required': 'Password is required',
        'string.min': 'Password must be at least 6 characters',
      }),

      phone: Joi.string()
        .length(10)
        .pattern(/^[0-9]+$/)
        .required()
        .messages({
          'string.length': 'Phone number must be exactly 10 digits',
          'string.pattern.base': 'Phone number must contain only digits',
          'any.required': 'Phone number is required',
        }),

      role: Joi.string().valid('customer', 'rider').optional(),
    }),
  },

  login: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Invalid email format',
     
      }),
      password: Joi.string().min(6).required().messages({
        'any.required': 'Password is required',
        'string.min': 'Password must be at least 6 characters',

      }),
    }),
  },
  
  otp: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Invalid email format',
        'string.empty': 'Email is required',
        
      }),
      OTP: Joi.string().min(6).required().messages({
        'any.required': 'OTP is required',
        'string.min': 'OTP must be at least 6 characters',
      }),
    }),
  },

  registerRider: {
    email: Joi.string().email().messages({
      'string.email': 'Invalid email format',
    }),
    body: Joi.object({
      licenseNumber: Joi.string().required().messages({
        'any.required': 'License number is required',
      }),

      licensePhoto: Joi.string().required().messages({
        'any.required': 'License photo is required',
      }),

      citizenshipNumber: Joi.string().required().messages({
        'any.required': 'Citizenship number is required',
      }),

      citizenshipPhoto: Joi.string().required().messages({
        'any.required': 'Citizenship photo is required',
      }),

      vehicleType: Joi.string()
        .valid('bike', 'car', 'scooter', 'others')
        .required()
        .messages({
          'any.required': 'Vehicle type is required',
          'any.only': 'Vehicle type must be one of bike, car, scooter, others',
        }),

      vehicleName: Joi.string().required().messages({
        'any.required': 'Vehicle name is required',
      }),

      vehicleModel: Joi.string().required().messages({
        'any.required': 'Vehicle model is required',
      }),

      vehiclePhoto: Joi.string().required().messages({
        'any.required': 'Vehicle photo is required',
      }),

      vehicleNumberPlate: Joi.string().required().messages({
        'any.required': 'Vehicle number plate is required',
      }),

      vehicleNumberPlatePhoto: Joi.string().required().messages({
        'any.required': 'Vehicle number plate photo is required',
      }),

      vehicleBlueBookPhoto: Joi.string().required().messages({
        'any.required': 'Vehicle blue book photo is required',
      }),
    }),
  },

  forgotPassword: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Invalid email format',
      }),
    }),
  },

  changePassword: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Invalid email format',
      }),

      OTP: Joi.string().min(6).required().messages({
        'any.required': 'OTP is required',
        'string.min': 'OTP must be at least 6 characters',
      }),

      newPassword: Joi.string().min(6).required().messages({
        'any.required': 'Password is required',
        'string.min': 'New Password must be at least 6 characters',
      }),

      retypePassword: Joi.string().min(6).required().messages({
        'any.required': 'ReTypePassword is required',
        'string.min': 'ReTypePassword must be at least 6 characters',
      }),
    }),
  },

  editProfileDetails: {
    body: Joi.object({
      

      fullname: Joi.string().min(3).optional().messages({
        'any.required': 'Fullname is required',
      }),

      phone: Joi.string()
        .length(10)
        .optional()
        .pattern(/^[0-9]+$/)
  
        .messages({
          'string.length': 'Phone number must be exactly 10 digits',
          'string.pattern.base': 'Phone number must contain only digits',
          'any.required': 'Phone number is required',
        }),

    }),
  },
};

export default userValidation;
