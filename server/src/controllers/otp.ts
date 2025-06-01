import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { sendRecoveryEmail, sendRideOtp } from '../services/mailer';
import { Otp } from '../models/otp';
import User from '../models/User';
import IRequest from '../middleware/IRequest';

// Send OTP to the rider when the ride is accepted
const sendOtpToRideRider = async (req: IRequest, res: Response) => {
  try {
    const ride = req.ride; // The ride object passed from acceptRideRequestByCustomer
    const riderId = ride?.riderId;

    if (!riderId) {
      return res.status(400).json({
        details: [{ message: 'Rider ID is missing in the ride' }],
      });
    }

    const rider = await User.findById(riderId);

    if (!rider) {
      return res.status(404).json({
        details: [{ message: 'Rider not found' }],
      });
    }

    const email = rider.email;
    if (!email) {
      return res.status(400).json({
        details: [{ message: 'Rider does not have an email address' }],
      });
    }

    // Generate and send OTP to rider email
    const token = await sendRideOtp(email);
    console.log('OTP sent to rider:', token);

    // Hash the OTP and store it in the database
    const hashedToken = await bcrypt.hash(token, 10);
    const expiryOTP = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    await Otp.updateOne(
      { email },
      {
        $set: {
          OTP: hashedToken,
          otpExpiresAt: expiryOTP,
        },
      },
      { upsert: true } // Insert new OTP if not exists
    );

    return res.status(200).json({
      success: true,
      message: 'OTP sent to the rider for the ride.',
    });
  } catch (e: unknown) {
    console.error('Error sending OTP to rider:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// Send OTP for user registration
const sendRegisterOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({ details: [{ message: 'User does not exist' }] });
    }

    // Call the function to send the recovery email
    const token= await sendRecoveryEmail(email);
    console.log(token);

    // Hash the OTP to save into the database
    const hashedToken = await bcrypt.hash(token, 10);

    const expiryOTP = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 minutes

    await Otp.updateOne(
      { email }, // find by email
      {
        $set: {
          OTP: hashedToken,
          otpExpiresAt: expiryOTP,
        },
      },
      { upsert: true } // insert new if not exists
    );

    return res.status(200).json({
      details: [
        {
          message: 'Otp Sent Successfully',
          existingUser,
        },
      ],
    });
  } catch (e: unknown) {
    console.error('Send OTP error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

const otpController = {
  sendRegisterOtp,
  sendOtpToRideRider,
};

export default otpController;
