import { Schema, model, Types, Document } from 'mongoose';

/**
 * Interface representing a Bid document.
 */
interface IBid extends Document {
  /** Unique identifier for the bid */
  _id: Types.ObjectId;

  /** Reference to the associated Ride */
  rideId: Types.ObjectId;

  /** Reference to the User who placed the bid */
  userId: Types.ObjectId;

  /** Bid amount */
  amount: number;

  /** Bid status */
  status: 'pending' | 'accepted' | 'rejected' | 'expired';

  /** Creation timestamp */
  createdAt: Date;
}

/**
 * Mongoose schema for bids placed by users on rides.
 */
const bidSchema = new Schema<IBid>(
  {
    rideId: {
      type: Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
      required: true,
    },
  },
  {
    // Only create 'createdAt' timestamp, no 'updatedAt'
    timestamps: { createdAt: true, updatedAt: false },
  }
);

/**
 * Mongoose model for Bid documents.
 */
const Bid = model<IBid>('Bid', bidSchema);

export default Bid;
