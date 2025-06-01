import { model, Schema, Types, Document } from 'mongoose';

/**
 * Interface representing a RiderList document.
 */
interface IRiderList extends Document {
  /** Reference to the rider (user) */
  riderId: Types.ObjectId;

  /** Reference to the ride */
  rideId: Types.ObjectId;

  /** Acceptance status of the rider for the ride */
  status: 'accepted' | 'not-accepted';
}

/**
 * Schema defining RiderList subdocument structure.
 */
const RiderListSchema = new Schema<IRiderList>(
  {
    riderId: {
      type: Schema.Types.ObjectId,
      required: true,
      description: 'ObjectId referencing the rider',
    },
    rideId: {
      type: Schema.Types.ObjectId,
      required: true,
      description: 'ObjectId referencing the ride',
    },
    status: {
      type: String,
      enum: ['accepted', 'not-accepted'],
      default: 'not-accepted',
      description: 'Rider acceptance status for the ride',
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

/**
 * RiderList model for managing rider-ride status entries.
 */
const RiderList = model<IRiderList>('RideList', RiderListSchema);

export default RiderList;
