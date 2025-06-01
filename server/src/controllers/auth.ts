import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import RiderDocuments from '../models/riderDocument';
import Vehicle from '../models/vehicle';
import env from '../Ienv';
import { sendRecoveryEmail } from '../services/mailer';
import bcrypt from 'bcrypt';
import { Otp } from '../models/otp';
import multer from 'multer';
import Rider from '../models/rider';

//normal registration
const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, fullname, password, phone } = req.body;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        details: [{ message: 'Email already used' }],
      });
    }

    const missingFields = [
      !email && 'email',
      !fullname && 'fullname',
      !password && 'password',
      !phone && 'phone',
    ].filter(Boolean);

    if (missingFields.length > 0) {
      return res.status(400).json({
        details: [
          {
            message: `Missing required  fields: ${missingFields.join(', ')}`,
          },
        ],
      });
    }
    // hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // 👤 Create user
    const user = await User.create({
      email,
      fullname,
      password: hashedPassword,
      role: 'customer',
      phone,
      isEmailVerified: false,
    });

    // res.status(201).json({
    //   message: 'Registered successfully',
    //   user,info
    // });

    return res.status(201).json({
      details: [
        {
          message: 'Registered successfully',
          user,
        },
      ],
    });
  } catch (e: unknown) {
    console.error('Register error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
//login
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    console.log('email:', email);
    console.log('password:', password);
    const existingUser = await User.findOne({ email });
    console.log('existingUser:', existingUser);
    if (!existingUser) {
      return res.status(400).json({ details: [{ message: 'User not exist' }] });
    }
    if (existingUser.isEmailVerified === false) {
      return res
        .status(200)
        .json({ details: [{ message: 'Your Email isnot verified yet ' }] });
    }

    // check password
    const matched = await bcrypt.compare(password, existingUser.password);
    if (!matched) {
      return res
        .status(400)
        .json({ details: [{ message: 'Invalid Email or Password ' }] });
    }
    console.log('matched:', matched);

    const token = jwt.sign(
      {
        userId: existingUser._id,
        role: existingUser.role,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('token:' + token);

    res.cookie('uid', token, {
      httpOnly: true, // JS can't access this cookie
      secure: true, // Only send over HTTPS
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (e: unknown) {
    console.error('Register error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

const registerRider = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      email,
      licenseNumber,
      citizenshipNumber,
      vehicleType,
      vehicleName,
      vehicleModel,
      vehicleNumberPlate,
    } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'User not found. Please register first.',
      });
    }

    // Check if license number is already used
    const existingLicense = await RiderDocuments.findOne({ licenseNumber });
    if (existingLicense) {
      return res.status(409).json({
        message: 'This license number is already registered.',
      });
    }

    // Check if citizenship number is already used
    const existingCitizenship = await RiderDocuments.findOne({ citizenshipNumber });
    if (existingCitizenship) {
      return res.status(409).json({
        message: 'This citizenship number is already registered.',
      });
    }

    // Check if rider has already submitted documents
    const existingRiderDocs = await RiderDocuments.findOne({ riderId: user._id });
    if (existingRiderDocs) {
      return res.status(409).json({
        message: 'Rider documents already submitted.',
      });
    }

    // Check if vehicle with same number plate exists
    const existingVehiclePlate = await Vehicle.findOne({ vehicleNumberPlate });
    if (existingVehiclePlate) {
      return res.status(409).json({
        message: 'This vehicle number plate is already registered.',
      });
    }

    // Check if vehicle already registered for this rider
    const existingVehicle = await Vehicle.findOne({ riderId: user._id });
    if (existingVehicle) {
      return res.status(409).json({
        message: 'Vehicle already registered for this rider.',
      });
    }

    // Handle uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const licensePhotoPath = files?.licensePhoto?.[0]?.path || null;
    const citizenshipPhotoPath = files?.citizenshipPhoto?.[0]?.path || null;
    const vehiclePhotoPath = files?.vehiclePhoto?.[0]?.path || null;
    const vehicleNumberPlatePhotoPath = files?.vehicleNumberPlatePhoto?.[0]?.path || null;
    const vehicleBlueBookPhotoPath = files?.vehicleBlueBookPhoto?.[0]?.path || null;

    if (
      !licensePhotoPath ||
      !citizenshipPhotoPath ||
      !vehiclePhotoPath ||
      !vehicleNumberPlatePhotoPath ||
      !vehicleBlueBookPhotoPath
    ) {
      return res.status(400).json({
        message: 'All required documents must be uploaded.',
      });
    }

    // Update role to rider and save
    user.role = 'rider';
    await user.save();

    // Create RiderDocuments
    const riderDocs = new RiderDocuments({
      licenseNumber,
      licensePhoto: licensePhotoPath,
      citizenshipNumber,
      citizenshipPhoto: citizenshipPhotoPath,
      riderId: user._id,
    });
    await riderDocs.save();

    // Create Vehicle
    const vehicle = new Vehicle({
      vehicleType,
      vehicleName,
      vehicleModel,
      vehicleNumberPlate,
      vehiclePhoto: vehiclePhotoPath,
      vehicleNumberPlatePhoto: vehicleNumberPlatePhotoPath,
      vehicleBlueBookPhoto: vehicleBlueBookPhotoPath,
      riderId: user._id,
    });
    await vehicle.save();

    // Send OTP to email
    const token  = await sendRecoveryEmail(email);
    const hashedToken = await bcrypt.hash(token, 10);
    const expiryOTP = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 mins

    await Otp.updateOne(
      { email },
      {
        $set: {
          OTP: hashedToken,
          otpExpiresAt: expiryOTP,
        },
      },
      { upsert: true }
    );

    // Save Rider record
    const rider = new Rider({
      userId: user._id,
      vehicleId: vehicle._id,
      documentId: riderDocs._id,
    });
    await rider.save();

    return res.status(201).json({
      message: 'Rider documents and vehicle registered successfully.',
      riderDocuments: riderDocs,
      vehicle,
    });
  } catch (error: any) {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds the limit of 10 MB.' });
    }

    console.error('Error registering rider:', error);
    return res.status(500).json({
      message: 'Something went wrong while registering rider documents.',
      error: error instanceof Error ? error.message : error,
    });
  }
};

//verify email from  OTP
const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, OTP } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        details: [{ message: 'Email Not Found' }],
      });
    }

    const otpDoc = await Otp.findOne({ email });
    if (!otpDoc) {
      return res.status(400).json({
        details: [{ message: 'Otp Not Found' }],
      });
    }
    console.log('otpDoc:', otpDoc.OTP);

    const otpValid = await bcrypt.compare(OTP, otpDoc.OTP);
    if (!otpValid) {
      return res.status(400).json({
        details: [{ message: 'Otp isnot Valid' }],
      });
    }

    user.isEmailVerified = true;
    await user.save();
    await Otp.deleteOne({ email });

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'OTP matched Successfully',
      user,
      token,
    });
  } catch (e: unknown) {
    console.error('Verify Error', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occured' });
    }
  }
};

//sends OTP message to user
const forgotPassword = async (
  req: Request,
  res: Response,
 
) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({ details: [{ message: 'User not exist' }] });
    }

    // Call the function to send the recovery email
    const token = await sendRecoveryEmail(email);
    console.log("token"+token);

    //hash the otp to save into the database
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
    console.error('Register error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

const setNewPassword = async(
  req:Request,
  res:Response,
  next:NextFunction
)=>{
  try{
    const {newPassword, email, otp} = req.body;

    const existingUser:any = await User.findOne({ email });


    // check user exists or not
    if (!existingUser) {
      return res.status(400).json({ details: [{ message: 'User not exist' }] });
    }

    const existingOtp:any = await Otp.findOne({ email })
    if(!existingOtp){
      return res.status(400).json({details:[{message:'Otp not found'}]})
    }


    if(existingOtp.otp !== otp){
      return res.status(400).json({details:[{message:'Otp does not match'}]})
    }

    //deleting otp after verification
    await Otp.deleteOne({ email });

    
    // hashing  new password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

   //update the new password
   await User.findOneAndUpdate(
    { email },
    {
      password: newHashedPassword,
    }
  );
  return res.status(200).json({
    details: [
      {
        message: 'Password changed Successfully',
        email: existingUser.email,
      },
    ],
  });
} catch (e: unknown) {
  console.error('Password setting error:', e);
  if (e instanceof Error) {
    return res.status(500).json({ message: e.message });
  } else {
    return res.status(500).json({ message: 'An unknown error occurred' });
  }
}
};


//change user password by validating otp sent in respective email
const changePassword = async (
  req: Request,
  res: Response,
) => {
  try {
    const { email, OTP, newPassword } = req.body;

    const existingUser = await User.findOne({ email });

    // check user exists or not
    if (!existingUser) {
      return res.status(400).json({ details: [{ message: 'User not exist' }] });
    }


    //check otp exists or not
    const otpDoc = await Otp.findOne({ email });
    if (!otpDoc) {
      return res.status(400).json({
        details: [{ message: 'Otp Not Found' }],
      });
    }

    //validate OTP
    const otpValid = await bcrypt.compare(OTP, otpDoc.OTP);
    if (!otpValid) {
      return res.status(400).json({
        details: [{ message: 'Otp isnot Valid' }],
      });
    }

    //delete OTP after successful OTP validation
    await Otp.deleteOne({ email });

    // hashing  new password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    //update the new password
    await User.findOneAndUpdate(
      { email },
      {
        password: newHashedPassword,
      }
    );

    return res.status(200).json({
      details: [
        {
          message: 'Password changed Successfully',
          existingUser,
        },
      ],
    });
  } catch (e: unknown) {
    console.error('Register error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

//Logout
const logout = async (req: Request, res: Response) => {
  try {
    console.log('Clearing cookie: uid');
    res.clearCookie('uid', { path: '/' });

    return res.status(200).json({
      message: 'Logout successful',
    });
  } catch (e: unknown) {
    console.error('Logout error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

const authController = {
  register,
  login,
  verifyEmail,
  registerRider,
  forgotPassword,
  setNewPassword,
  changePassword,
  logout,
};

export default authController;
