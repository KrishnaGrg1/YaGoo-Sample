import { Schema, model, Types, Document } from 'mongoose';

/**
 * Coordinates represent geographical latitude and longitude.
 */
interface Coordinates {
  /** Latitude of the location */
  latitude: number;
  /** Longitude of the location */
  longitude: number;
}

/**
 * Location represents a physical place with an address and coordinates.
 */
interface Location {
  /** Human-readable address string */
  address: string;
  /** Geographical coordinates */
  coordinates: Coordinates;
}

/**
 * Interface representing a Ride document in MongoDB.
 */
interface IRide extends Document {
  /** Reference to the user who requested the ride */
  customerId: Types.ObjectId;

  /** Reference to the rider assigned to the ride (optional) */
  riderId?: Types.ObjectId;

  /** Starting location of the ride */
  start_location: Location;

  /** Destination location of the ride */
  destination: Location;

  /** OTP string used to verify ride start */
  otp_start: string;

  /** Current status of the ride */
  status:
    | 'not-started'
    | 'requested'
    | 'matched'
    | 'in-progress'
    | 'completed'
    | 'cancelled';

  /** Distance of the ride in appropriate unit (e.g., kilometers) */
  distance: number;

  /** Payment status for the ride */
  paymentStatus: 'completed' | 'not received' | 'pending';

  /** Minimum price agreed for the ride */
  minimumPrice: number;

  /** Reference to the bid associated with the ride (optional) */
  bidId?: Types.ObjectId;

  /** Flag indicating if customer has arrived at pickup */
  customerArrived: boolean;

  /** Flag indicating if rider has arrived at pickup */
  riderArrived: boolean;

  /** Timestamp marking the start time of the ride (optional) */
  startTimer?: Date;

  /** Timestamp marking the end time of the ride (optional) */
  endTimer?: Date;

  /** Total duration of the ride, stored as number (seconds or minutes) */
  totalTime?: number;

  /** Timestamp when the document was created */
  createdAt: Date;

  /** Timestamp when the document was last updated */
  updatedAt: Date;
}

/**
 * Schema for geographical coordinates without its own _id.
 */
const coordinatesSchema = new Schema<Coordinates>(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { _id: false }
);

/**
 * Schema for a location with address and coordinates.
 */
const locationSchema = new Schema<Location>(
  {
    address: { type: String, required: true },
    coordinates: { type: coordinatesSchema, required: true },
  },
  { _id: false }
);

/**
 * Mongoose schema defining the Ride collection structure.
 */
const rideSchema = new Schema<IRide>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      description: 'Reference to the user who requested the ride',
    },
    riderId: {
      type: Schema.Types.ObjectId,
      ref: 'Rider',
      required: false,
      description: 'Reference to the rider assigned to the ride',
    },
    start_location: {
      type: locationSchema,
      required: true,
      description: 'Pickup location of the ride',
    },
    destination: {
      type: locationSchema,
      required: true,
      description: 'Destination location of the ride',
    },
    otp_start: {
      type: String,
      required: false,
      description: 'OTP used to confirm ride start',
    },
    status: {
      type: String,
      enum: [
        'not-started',
        'requested',
        'matched',
        'in-progress',
        'completed',
        'cancelled',
      ],
      default: 'requested',
      description: 'Current status of the ride lifecycle',
    },
    customerArrived: {
      type: Boolean,
      default: false,
      description: 'Indicates if customer arrived at pickup location',
    },
    riderArrived: {
      type: Boolean,
      default: false,
      description: 'Indicates if rider arrived at pickup location',
    },
    paymentStatus: {
      type: String,
      enum: ['not received', 'pending', 'completed'],
      default: 'not received',
      description: 'Current payment status for the ride',
    },
    distance: {
      type: Number,
      required: true,
      description: 'Distance between pickup and destination',
    },
    minimumPrice: {
      type: Number,
      required: true,
      description: 'Minimum price to be paid for the ride',
    },
    bidId: {
      type: Schema.Types.ObjectId,
      ref: 'Bid',
      required: false,
      description: 'Reference to a bid document for this ride',
    },
    startTimer: {
      type: Date,
      description: 'Timestamp when ride started',
    },
    endTimer: {
      type: Date,
      description: 'Timestamp when ride ended',
    },
    totalTime: {
      type: Number,
      description: 'Duration of the ride in seconds or minutes',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Ride model for CRUD operations on Ride documents.
 */
const Ride = model<IRide>('Ride', rideSchema);

export default Ride;
