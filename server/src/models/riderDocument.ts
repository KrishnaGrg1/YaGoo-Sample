import { Document, model, Schema, Types } from "mongoose";

/**
 * Interface representing the Rider Document details.
 */
interface rInterface extends Document {
  /** Unique license number of the rider */
  licenseNumber: string;

  /** Photo URL or path of the license */
  licensePhoto: string;

  /** Unique citizenship number */
  citizenshipNumber: string;

  /** Photo URL or path of the citizenship */
  citizenshipPhoto: string;

  /** Verification status of the rider documents */
  isRiderVerified: boolean;

  /** Reference to the rider (User) */
  riderId: Types.ObjectId;
}

/**
 * Schema defining the structure of rider documents.
 */
const riderDocumentSchema = new Schema<rInterface>(
  {
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      description: "Unique license number of the rider",
    },
    licensePhoto: {
      type: String,
      required: true,
      unique: true,
      description: "Photo URL or path of the license",
    },
    citizenshipNumber: {
      type: String,
      required: true,
      unique: true,
      description: "Unique citizenship number",
    },
    citizenshipPhoto: {
      type: String,
      required: true,
      unique: true,
      description: "Photo URL or path of the citizenship",
    },
    isRiderVerified: {
      type: Boolean,
      default: false,
      description: "Verification status of the rider documents",
    },
    riderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      description: "Reference to the rider (User)",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

/**
 * Mongoose model for rider document details.
 */
const RiderDocuments = model<rInterface>("RiderDocument", riderDocumentSchema);

export default RiderDocuments;
