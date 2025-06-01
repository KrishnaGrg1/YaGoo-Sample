import { Document, model, Schema } from 'mongoose';

/**
 * User roles allowed in the system.
 */
export type UserRole = 'customer' | 'rider' | 'admin';

/**
 * Coordinates represent geographic latitude and longitude.
 */
interface Coordinates {
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
}

/**
 * Location subdocument representing an address with coordinates.
 */
interface Location {
  /** Physical address string */
  address: string;
  /** Geographic coordinates for the location */
  coordinates: Coordinates;
}

/**
 * IUser interface representing the User document in MongoDB.
 */
export interface IUser extends Document {
  /** User's email address (unique) */
  email: string;
  /** User's full name */
  fullname: string;
  /** Hashed user password */
  password: string;
  /** User role, restricted to specific values */
  role: UserRole;
  /** User phone number */
  phone: string;
  /** Flag indicating if user's email is verified */
  isEmailVerified: boolean;
  /** Optional current location of the user */
  currentLocation?: Location;
}

/**
 * Coordinates sub-schema (no _id field) for embedded documents.
 */
const coordinatesSchema = new Schema<Coordinates>(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { _id: false }
);

/**
 * Location sub-schema embedding address and coordinates.
 */
const locationSchema = new Schema<Location>(
  {
    address: { type: String, required: true },
    coordinates: { type: coordinatesSchema, required: true },
  },
  { _id: false }
);

/**
 * Main User schema representing users in the ride-sharing app.
 */
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      description: 'Unique user email address',
    },
    password: {
      type: String,
      required: true,
      description: 'Hashed password for authentication',
    },
    role: {
      type: String,
      enum: ['customer', 'rider', 'admin'],
      default: 'customer',
      description: 'Role of the user within the system',
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      description: 'Full name of the user',
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      description: 'User contact phone number',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      description: 'Whether the user has verified their email',
    },
    currentLocation: {
      type: locationSchema,
      required: false,
      description: 'Current physical location of the user',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

/**
 * User model to perform CRUD operations on User documents.
 */
const User = model<IUser>('User', userSchema);

export default User;
