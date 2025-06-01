import axios from 'axios';

/**
 * Interface representing the structure of the OSRM API response.
 */
interface OSRMResponse {
  routes: {
    distance: number; // Distance in meters
  }[];
}

/**
 * Calculates the road distance (in kilometers) between two coordinates using OSRM API.
 *
 * @param startLat - Latitude of the starting point
 * @param startLng - Longitude of the starting point
 * @param endLat - Latitude of the destination
 * @param endLng - Longitude of the destination
 * @returns Road distance in kilometers or null if unable to calculate
 */
export async function calculateRoadDistance(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<number | null> {
  try {
    const url = `http://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`;

    const response = await axios.get<OSRMResponse>(url);

    if (response.data.routes?.length > 0) {
      const distanceInMeters = response.data.routes[0].distance;
      const distanceInKilometers = distanceInMeters / 1000;
      return distanceInKilometers;
    }

    return null;
  } catch (error) {
    console.error('Error calculating road distance:', error instanceof Error ? error.message : error);
    return null;
  }
}

// Example usage (uncomment to test)
// (async () => {
//   const distance = await calculateRoadDistance(27.7172, 85.324, 27.6727, 85.4298);
//   console.log('Distance in km:', distance);
// })();
