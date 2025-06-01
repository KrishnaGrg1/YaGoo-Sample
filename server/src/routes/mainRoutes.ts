import { Router } from "express";
import authRouter from "./auth";
import getUserfromAuthToken from "../middleware/jwtfromUser";
import rideRouter from "./rides";
import profileRouter from "./profile";

const mainRoutes = Router();

/**
 * Public Authentication Routes
 * Includes login, registration, email verification, etc.
 * No authentication required for these routes.
 */
mainRoutes.use('/auth', authRouter);

/**
 * Protected Ride Routes
 * All ride-related operations (create, bid, cancel, etc.)
 * Require a valid JWT, verified via `getUserfromAuthToken` middleware.
 */
mainRoutes.use('/rides', getUserfromAuthToken, rideRouter);

/**
 * Protected Profile Routes
 * Includes viewing/updating profile, switching roles, changing password, etc.
 * Require a valid JWT, verified via `getUserfromAuthToken` middleware.
 */
mainRoutes.use('/profile', getUserfromAuthToken, profileRouter);

export default mainRoutes;
