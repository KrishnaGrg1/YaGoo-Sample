// 📍 Coordinate data (Latitude & Longitude)
interface Coordinates {
  latitude: number;
  longitude: number;
}

// 📌 Location containing address and coordinates
interface Location {
  address: string;
  coordinates: Coordinates;
}

// 🚗 Create Ride Request DTO
interface CreateRideRequest {
  pickup: Location;         // Pickup location
  destination: Location;    // Destination location
  distance: number;         // Distance in kilometers
  minimumPrice: number;     // Minimum price the customer is willing to pay
}

// 🧾 Exporting types
export type { CreateRideRequest, Location, Coordinates };
