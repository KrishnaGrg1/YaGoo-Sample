import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface representing an OTP document.
 */
export interface IOtp extends Document {
  /** Email address for which the OTP is generated */
  email: string;

  /** The one-time password (OTP) code */
  OTP: string;

  /** Expiration date/time of the OTP, after which it will be automatically deleted */
  otpExpiresAt: Date;

  /** Document creation timestamp */
  createdAt: Date;
}

/**
 * Mongoose schema for OTP collection.
 */
const otpSchema = new Schema<IOtp>(
  {
    email: { 
      type: String, 
      unique: true, 
      required: true 
    },
    OTP: { 
      type: String, 
      required: true 
    },
    otpExpiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index to automatically delete document at expiry
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

/** 
 * Model for OTP documents.
 */
export const Otp = mongoose.model<IOtp>('Otp', otpSchema);
