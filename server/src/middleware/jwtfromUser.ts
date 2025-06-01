import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import env from "../Ienv";
import IRequest from "./IRequest";

/**
 * Middleware to extract userId from the Authorization Bearer token.
 * Attaches userId to the request object if token is valid.
 * Returns 401 or 403 status if token is missing or invalid.
 */
const getUserfromAuthToken = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    // Verify JWT token using the secret
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // If decoded is a string (which shouldn't be the case), deny access
    if (typeof decoded === "string") {
      return res.status(403).json({ message: "You are not authorized" });
    }

    // Attach userId from token payload to request object
    req.userId = (decoded as JwtPayload).userId;
    console.log("Authenticated userId:", req.userId);

    next();
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error("Authentication error:", e.message);
      res.status(401).json({ message: e.message });
    } else {
      console.error("Unknown authentication error:", e);
      res.status(401).json({ message: "Authentication failed" });
    }
  }
};

export default getUserfromAuthToken;
