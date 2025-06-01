import express from 'express';
import validate from '../middleware/validation';
import rideValidation from '../validations/rides';
import rideController from '../controllers/rides';

const rideRouter = express.Router();

/**
 * Create a ride — includes start/destination address, distance, and base price.
 */
rideRouter.post(
  '/create',
  validate(rideValidation.findRide),
  rideController.createRideRequest
);

/**
 * Customer places a bid after creating a ride.
 */
rideRouter.post(
  '/bid',
  validate(rideValidation.placeBid),
  rideController.submitBid
);

/**
 * Cancel a ride before it’s assigned to any rider.
 */
rideRouter.delete('/cancel', rideController.cancelRide);

/**
 * Rider gets all available ride requests from customers.
 */
rideRouter.get('/requests', rideController.getAllRequestedRides);

rideRouter.get('/:rideId',rideController.getRideById);
/**
 * Rider sends a request to take a ride.
 */
rideRouter.post(
  '/rider-request',
  validate(rideValidation.requestRideByRider),
  rideController.requestRideAsRider
);

/**
 * Customer gets all rider requests for their ride.
 */
rideRouter.get('/available-riders', rideController.getAvailableRiders);

/**
 * Customer accepts a specific rider and sends OTP.
 */
rideRouter.post('/accept', rideController.acceptRideRequestByCustomer);

/**
 * Customer rejects a rider request.
 */
rideRouter.delete('/reject-rider', rideController.rejectRider);

/**
 * Customer marks that the rider has not arrived.
 */
rideRouter.post('/customer-not-arrived', rideController.customerNotArrived);

/**
 * Rider views the OTP provided by customer.
 */
rideRouter.get('/view-otp', rideController.viewRiderOtp);

/**
 * Customer verifies ride using OTP.
 */
rideRouter.post('/verify-ride-otp', rideController.verifyRideOtp);

/**
 * Rider or system marks the ride as completed.
 */
rideRouter.post('/complete-ride', rideController.completedRide);

/**
 * Customer submits a ride review.
 */
rideRouter.post('/submit-ride-review', rideController.submitRideReview);

/**
 * Rider confirms payment receipt.
 */
rideRouter.post('/received-payment', rideController.payment);

/**
 * Get riders sorted by number of completed rides.
 */
rideRouter.get('/top-riders-rides', rideController.topRidersByRides);

export default rideRouter;
