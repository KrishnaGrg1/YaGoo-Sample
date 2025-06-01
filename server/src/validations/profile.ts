
import Joi from 'joi';

const profileValidation = {

    changePassword :
    {
        body : Joi.object({

            oldPassword : Joi.string().min(6).required().messages({
                'any.required': "Old Password is required",
                'string.min': "Old Password must be at least 6 characters "
            }),

             newPassword : Joi.string().min(6).required().messages({
                'any.required': "New Password is required",
                'string.min': "New Password must be at least 6 characters "
            })

            
        })
    }
}

export default profileValidation;