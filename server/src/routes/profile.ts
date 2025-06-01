import { Router } from "express";
import profileController from "../controllers/profile";
import validate from "../middleware/validation";
import userValidation from "../validations/auth";
import profileValidation from "../validations/profile";

//A router instance for profile routes
const profileRouter = Router();

/**
 * Get the logged-in user's ride history.
 */
profileRouter.get('/history', profileController.viewHistory);

/**
 * Get detailed profile information of the logged-in user.
 */
profileRouter.get('/details', profileController.userDetails);

/**
 * Update user profile details like name, phone, etc.
 */
profileRouter.put(
  '/edit',
  validate(userValidation.editProfileDetails),
  profileController.editProfileDetails
);

/**
 * Switch between customer and rider roles.
 */
profileRouter.post('/switch-role', profileController.switchRole);

/**
 * View rider-specific profile info (only for users with rider role).
 */
profileRouter.get('/riderProfile', profileController.viewRiderProfile);

/**
 * Delete the user's profile from the system.
 */
profileRouter.delete('/deleteProfile', profileController.deleteUser);

/**
 * Change account password for the logged-in user.
 */
profileRouter.put(
  '/changePassword',
  validate(profileValidation.changePassword),
  profileController.changePassword
);

export default profileRouter;