import { Document, model, Types, Schema } from 'mongoose';

/**
 * Interface representing a Rider document.
 */
export interface IRider extends Document {
  /** Reference to the User document representing this rider */
  userId: Types.ObjectId;

  /** Reference to the Vehicle document associated with this rider */
  vehicleId: Types.ObjectId;

  /** Reference to the Document document containing rider verification info */
  documentId: Types.ObjectId;

  /** Average rating of the rider */
  averageRating: number;

  /** Total number of rides completed by the rider */
  totalRides: number;
}

/**
 * Mongoose schema for Rider collection.
 */
const riderSchema = new Schema<IRider>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRides: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

/**
 * Rider model based on the riderSchema.
 */
const Rider = model<IRider>('Rider', riderSchema);

export default Rider;
