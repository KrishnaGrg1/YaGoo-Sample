import { Document, Schema, model, Types } from 'mongoose';

/**
 * Allowed vehicle types in the system.
 */
type VehicleType = 'bike' | 'scooter' | 'car' | 'others';

/**
 * Interface representing a Vehicle document.
 */
interface VehicleInterface extends Document {
  /** Type of the vehicle (e.g., bike, scooter, car) */
  vehicleType: VehicleType;
  /** Name or brand of the vehicle */
  vehicleName: string;
  /** Model of the vehicle */
  vehicleModel: string;
  /** URL or path to the vehicle's photo */
  vehiclePhoto: string;
  /** Vehicle's number plate string */
  vehicleNumberPlate: string;
  /** URL or path to photo of the number plate */
  vehicleNumberPlatePhoto: string;
  /** URL or path to vehicle blue book photo */
  vehicleBlueBookPhoto: string;
  /** Whether the vehicle has been verified */
  isVehicleVerified: boolean;
  /** Reference to the rider (user) owning this vehicle */
  riderId: Types.ObjectId;
}

/**
 * Vehicle schema definition.
 */
const vehicleSchema = new Schema<VehicleInterface>(
  {
    vehicleType: {
      type: String,
      required: true,
      enum: ['bike', 'scooter', 'car', 'others'],
      description: 'Type/category of the vehicle',
    },
    vehicleName: {
      type: String,
      required: true,
      description: 'Brand or name of the vehicle',
    },
    vehicleModel: {
      type: String,
      required: true,
      description: 'Model details of the vehicle',
    },
    vehiclePhoto: {
      type: String,
      required: true,
      unique: true,
      description: 'Image URL or path of the vehicle photo',
    },
    vehicleNumberPlate: {
      type: String,
      required: true,
      unique: true,
      description: 'Unique vehicle number plate',
    },
    vehicleNumberPlatePhoto: {
      type: String,
      required: true,
      unique: true,
      description: 'Photo of the vehicle number plate',
    },
    vehicleBlueBookPhoto: {
      type: String,
      required: true,
      unique: true,
      description: 'Official blue book photo of the vehicle',
    },
    isVehicleVerified: {
      type: Boolean,
      default: false,
      description: 'Verification status of the vehicle',
    },
    riderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      description: 'Reference to the owner (rider) of this vehicle',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

/**
 * Vehicle model for CRUD operations.
 */
const Vehicle = model<VehicleInterface>('Vehicle', vehicleSchema);

export default Vehicle;
