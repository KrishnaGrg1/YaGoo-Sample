import { NextFunction, Response } from 'express';
import IRequest from '../middleware/IRequest';
import Ride from '../models/rides';
import User, { IUser } from '../models/User';
import Bid from '../models/bid';
import RiderDocuments from '../models/riderDocument';
import Vehicle from '../models/vehicle';
import Rider from '../models/rider';
import { riderUpload } from '../routes/auth';
import authController from './auth';
import bcrypt from 'bcrypt';

// Fetch user details (common for customer and rider)
const userDetails = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    // Ensure the request is authenticated
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find the user in the database
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        details: [{ message: 'User does not exist' }],
      });
    }

    const { fullname, role, phone, isEmailVerified, email } = existingUser;

    // Prepare the base response object
    const responseData: any = {
      fullname,
      role,
      phone,
      isEmailVerified,
      email,
    };

    // If the user is a rider, fetch and include rider-specific data
    if (role === 'rider') {
      const riderDocs = await RiderDocuments.findOne({ riderId: userId });
      const vehicle = await Vehicle.findOne({ riderId: userId });

      if (riderDocs) {
        responseData.riderDocuments = {
          licenseNumber: riderDocs.licenseNumber,
          citizenshipNumber: riderDocs.citizenshipNumber,
          licensePhoto: riderDocs.licensePhoto,
          citizenshipPhoto: riderDocs.citizenshipPhoto,
        };
      }

      if (vehicle) {
        responseData.vehicle = {
          vehicleType: vehicle.vehicleType,
          vehicleName: vehicle.vehicleName,
          vehicleModel: vehicle.vehicleModel,
          vehicleNumberPlate: vehicle.vehicleNumberPlate,
          vehiclePhoto: vehicle.vehiclePhoto,
          vehicleNumberPlatePhoto: vehicle.vehicleNumberPlatePhoto,
          vehicleBlueBookPhoto: vehicle.vehicleBlueBookPhoto,
        };
      }
    }

    return res.status(200).json({
      message: 'User details shown',
      user: responseData,
    });
  } catch (e: unknown) {
    console.error('Error fetching user details:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }
    return res.status(500).json({ message: 'An unknown error occurred' });
  }
};

// Edit profile details (fullname and phone)
const editProfileDetails = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId; // Get user ID from authentication middleware

    // Check if userId is available (i.e., user is authenticated)
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify user exists in the database
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        details: [{ message: 'User does not exist' }],
      });
    }

    // Extract fields to be updated from request body
    const { fullname, phone } = req.body;

    // Update user details and return the new document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullname, phone },
      { new: true } // Return the updated document
    );

    return res.status(200).json({
      message: 'User details updated successfully',
      user: updatedUser, // Return updated user data if needed
    });
  } catch (e: unknown) {
    console.error('Error updating user details:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }
    return res.status(500).json({ message: 'An unknown error occurred' });
  }
};

//View history for both riders and customer
const viewHistory = async (req: IRequest, res: Response) => {
  try {
    // Check if the user is authenticated
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized: userId missing.' });
    }

    // Find the user based on userId
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found!' });
    }

    let rides: any[] = [];

    // Retrieve rides based on user role
    if (user.role === 'rider') {
      rides = await Ride.find({ riderId: req.userId });
    } else if (user.role === 'customer') {
      rides = await Ride.find({ customerId: req.userId });
    }

    // If no rides found, return empty array
    // if (rides.length === 0) {
    //   rides: [];
    //    res.status(200).json({ message: 'No ride history found.' });
    //    return
    // }

    // Format each ride with related bid and time info
    const history = await Promise.all(
      rides.map(async (ride) => {
        const bid = await Bid.findById(ride.bidId);

        // Format total ride time in "Xm Ys" format
        let formattedTime = 'N/A';
        if (ride.totalTime !== undefined && ride.totalTime !== null) {
          const totalSeconds = ride.totalTime;
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          formattedTime = `${minutes}m ${seconds}s`;
        }
        const totaldistance = Number(ride.distance.toFixed(4));
        return {
          customer: ride.customerId,
          start_location:
            ride.start_location?.address || 'Unknown Start Location',
          destination: ride.destination?.address || 'Unknown Destination',
          distance: totaldistance || 0,
          amount: bid?.amount ?? 'N/A',
          totalTime: formattedTime,
          status: ride.status || 'Unknown',
          date: ride.createdAt
            ? new Date(ride.createdAt).toISOString().split('T')[0]
            : 'Unknown Date',
        };
      })
    );

   // console.log('Ride history fetched successfully:', history);

    // return res.status(200).json({ rides: history });
    return res.status(200).json({
      rides: history || [],
      message:
        history.length === 0
          ? 'No ride history found.'
          : 'Ride history fetched successfully.',
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(511).json({
        message: error.message,
      });
    }
    console.error('Error fetching ride history:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

const viewRiderProfile = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { riderId } = req.body;
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: userId missing.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found!' });
    }

    const riderDetails = await Rider.findById(riderId); // check rider details in db

    if (!riderDetails) {
      return res.status(400).json({
        message: false,
        details: [{ message: `Rider  Riding Details not found` }],
      });
    }

    const riderProfile = await User.findById(riderDetails.userId);

    if (!riderProfile) {
      return res.status(400).json({
        message: false,
        details: [{ message: `Rider Normal Details not found` }],
      });
    }

    //Basic Rider Details
    const email = riderProfile.email;
    const phone = riderProfile.phone;
    const fullname = riderProfile.fullname;

    //Rider Riding Details
    const totalRides = riderDetails.totalRides;
    const averageRating = riderDetails.averageRating;

    return res.status(200).json({
      message: true,
      details: [
        {
          message: `Rider Profile successfully shown`,
          email: email,
          phone: phone,
          fullname: fullname,

          totalRides: totalRides,
          averageRating: averageRating,
        },
      ],
    });
  } catch (e: unknown) {
    console.error('Complete ride error', e);
    return res.status(500).json({
      status: false,
      message: e instanceof Error ? e.message : 'An unknown error occurred',
    });
  }
};

const switchRole = async (req: IRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        details: [{ message: 'Unauthorized: User ID not found' }],
      });
      return;
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      res.status(404).json({
        details: [{ message: 'User not found' }],
      });
      return;
    }

    if (existingUser.role === 'customer') {
      const existingRider = await Rider.findOne({ userId });

      if (!existingRider) {
        res.status(403).json({
          details: [
            {
              message: 'Rider registration required',
              requiresRegistration: true,
            },
          ],
        });
        return;
      }

      existingUser.role = 'rider';
      await existingUser.save();

      res.status(200).json({
        details: [
          {
            existingUser,
            message: 'Role switched from customer to rider',
            currentRole: 'rider',
            requiresRegistration: false,
          },
        ],
      });
      return;
    }

    // If current role is rider
    if (existingUser.role === 'rider') {
      // Change role to customer
      existingUser.role = 'customer';
      await existingUser.save();

      res.status(200).json({
        details: [
          {
            message: 'Role switched from rider to customer',
            currentRole: 'customer',
            requiresRegistration: false,
          },
        ],
      });
      return;
    }

    // Invalid role
    res.status(400).json({
      details: [{ message: 'Invalid current role' }],
    });
  } catch (error) {
    console.error('Switch role error:', error);
    res.status(500).json({
      details: [
        {
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred while switching roles',
        },
      ],
    });
  }
};

//delete user profile
const deleteUser = async (req: IRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    // Check if user is authenticated
    if (!userId) {
      res.status(401).json({
        details: [{ message: 'Unauthorized' }],
      });
      return;
    }

    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      res.status(404).json({
        details: [{ message: 'User does not exist' }],
      });
      return;
    }

    const existingRider = await Rider.findOne({ userId: existingUser._id });

    // Delete related rider data if applicable
    if (existingUser.role === 'rider' || existingRider) {
      await Promise.all([
        RiderDocuments.deleteOne({ riderId: userId }),
        Vehicle.deleteOne({ riderId: userId }),
        Rider.deleteOne({ userId: userId }),
      ]);
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (e: any) {
    console.error('Error deleting user:', e);

    // Only respond once
    const errorMessage =
      e instanceof Error ? e.message : 'An unknown error occurred';
    res.status(500).json({ message: errorMessage });
  }
};

//change password
const changePassword = async (req: IRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;

    // Check if user is authenticated
    if (!userId) {
      res.status(401).json({
        details: [
          {
            message: 'Unauthorized',
          },
        ],
      });
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
      res.status(404).json({
        details: [{ message: 'User does not exist' }],
      });
      return;
    }

    const matched = await bcrypt.compare(oldPassword, existingUser.password);

    if (!matched) {
      res.status(404).json({
        details: [
          {
            message: 'Old password is wrong',
          },
        ],
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    existingUser.password = hashedPassword;
    await existingUser.save();

    res.status(200).json({
      message: 'Password changed successfully',
    });
    return;
  } catch (e: any) {
    console.error('Error deleting user:', e);
    if (e instanceof Error) {
      res.status(500).json({ message: e.message });
    }
    res.status(500).json({ message: 'An unknown error occurred' });
  }
};

// Add switchRole to the controller export
const profileController = {
  userDetails,
  editProfileDetails,
  viewHistory,
  viewRiderProfile,
  switchRole, // Add this line
  deleteUser,
  changePassword,
};

export default profileController;
