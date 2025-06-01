import express from 'express';
import authController from '../controllers/auth';
import validate from '../middleware/validation';
import userValidation from '../validations/auth';
import upload from '../middleware/multerConfig';
import otpController from '../controllers/otp';

const authRouter = express.Router();

// Multer configuration for rider registration file uploads
export const riderUpload = upload.fields([
  { name: 'licensePhoto', maxCount: 1 },
  { name: 'citizenshipPhoto', maxCount: 1 },
  { name: 'vehiclePhoto', maxCount: 1 },
  { name: 'vehicleNumberPlatePhoto', maxCount: 1 },
  { name: 'vehicleBlueBookPhoto', maxCount: 1 },
]);

/**
 * User Registration Route
 * Registers a new user (customer by default).
 */
authRouter.post(
  '/register',
  validate(userValidation.register),
  authController.register
);

/**
 * User Login Route
 * Authenticates user and returns access token.
 */
authRouter.post('/login', validate(userValidation.login), authController.login);

/**
 * Verify Email via OTP
 * Verifies user's email after registration.
 */
authRouter.post(
  '/verifyOTP',
  validate(userValidation.otp),
  authController.verifyEmail
);

/**
 * Set New Password (One-time use)
 * Used during OTP-based registration/password reset flow.
 */
authRouter.post('/set-new-password', authController.setNewPassword);

/**
 * Send OTP for Registration or Password Reset
 * Sends OTP to user's email or phone.
 */
authRouter.post(
  '/sendOTP',
  validate(userValidation.forgotPassword),
  otpController.sendRegisterOtp
);

/**
 * Forgot Password
 * Sends reset link or triggers password reset process.
 */
authRouter.post(
  '/forgotPassword',
  validate(userValidation.forgotPassword),
  authController.forgotPassword
);

/**
 * Rider Registration Route
 * Registers a rider with uploaded documents (license, vehicle info, etc.).
 */
authRouter.post('/register-rider', riderUpload, authController.registerRider);

/**
 * Change Password
 * Allows user to change password from their profile/settings.
 */
authRouter.post(
  '/changePassword',
  validate(userValidation.changePassword),
  authController.changePassword
);

/**
 * Logout User
 * Invalidates the session or access token.
 */
authRouter.post('/logout', authController.logout);

export default authRouter;
