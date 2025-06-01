import { Request } from "express";

/**
 * Custom Request interface extending Express Request to include
 * additional properties added during middleware processing.
 */
export default interface IRequest extends Request {
  /**
   * ID of the authenticated user (usually added after token verification)
   */
  userId?: string;

  /**
   * Ride object associated with the request (e.g., loaded in middleware)
   * Replace `any` with a more specific interface/type if available.
   */
  ride?: any;
}
