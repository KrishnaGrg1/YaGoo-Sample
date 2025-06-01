import { Document, model, Schema, Types } from "mongoose";

/**
 * Interface representing a Review document.
 */
interface IReview extends Document {
  /** Reference to the Ride being reviewed */
  rideId: Types.ObjectId;

  /** Reference to the Rider (User) who is reviewed */
  riderId: Types.ObjectId;

  /** Optional comment provided by the reviewer */
  comment?: string;

  /** Rating score given to the rider, from 1 to 5 */
  rating: number;
}

/**
 * Mongoose schema for Review collection.
 */
const ReviewSchema = new Schema<IReview>(
  {
    rideId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Ride",
    },
    riderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    comment: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

/**
 * Review model based on the ReviewSchema.
 */
const Review = model<IReview>("Review", ReviewSchema);

export default Review;
