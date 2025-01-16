import { generateToken } from '../lib/utils.js'
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs'
import cloudinary from '../lib/cloudinary.js';
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail
} from '../nodemailer/email.config.js'

import upload from '../middleware/upload.js'

// const storage = multer.memoryStorage(); // Store the file in memory (you can also store it on disk)
// const upload = multer({ storage });

export const signup = async (req, res) => {
  const { firstName, lastName, email, password, role, gender } = req.body;
  try {
    if (!firstName || !lastName || !email || !password || !role || !gender) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString()

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      gender,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();
      await sendVerificationEmail(newUser.email, newUser.firstName, verificationToken)

      res.status(201).json({
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        role: newUser.role,
        gender: newUser.gender,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' })
    }

    user.isVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpiresAt = undefined
    await user.save()
    await sendWelcomeEmail(user.email, user.firstName)

    res.status(200).json({ 
      success: true,  
      message: 'Email verified successfully!',
      user: {
        ...user._doc,
        password: undefined,
      }
    })
  } catch (error) {
    console.log("Error in verifyEmail controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);
    user.lastLogin = new Date()
    await user.save()

    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role,
    });

  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ success: false, message: 'Email not found!' })
    }

    // generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex')
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000

    user.resetPasswordToken = resetToken
    user.resetPasswordExpiresAt = resetTokenExpiresAt

    await user.save()
    await sendPasswordResetEmail(user.email, `${process.env.USER_CLIENT_URL}/rest-password/${ resetToken }`)

    res.status(200).json({ success: true, message: 'Password reset link sent to your email address.' })
  } catch (error) {
    console.log('Error in forgotPassword user.controller', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body
    
    const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		})
    if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" })
		}

    const hashedPassword = await bcrypt.hash(password, 10)
    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpiresAt = undefined

    await user.save()
    await sendResetSuccessEmail(user.email)

    res.status(200).json({ success: true, message: "Password reset successfully" })
  } catch (error) {
    console.log('Error in resetPassword user.controller', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

export const updateMyProfile = async (req, res) => {
  try {
    const uploadMiddleware = upload.single('profilePic');
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: 'File upload error', error: err.message });
      }

      const userId = req.user._id;
      const {
        firstName,
        lastName,
        gender,
        dob,
        phone,
        idNumber,
        occupation,
        address1,
        address2,
      } = req.body;

      if (!firstName || !lastName) {
        return res.status(400).json({ message: 'First name and last name are required.' });
      }
      const updateData = {
        firstName,
        lastName,
        'userFields.dob': dob,
        'userFields.phone': phone,
        'userFields.idNumber': idNumber,
        'userFields.occupation': occupation,
        'userFields.address1': address1,
        'userFields.address2': address2,
      };

      try {
        // Handle profilePic upload
        const imageFile = req.file;
        if (imageFile) {
          const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
          updateData.profilePic = imageUpload.secure_url;
        }

        // Update user profile in the database
        const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true });

        if (!updatedUser) {
          return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(updatedUser);
      } catch (innerError) {
        console.error('Error during profile update:', innerError.message);
        res.status(500).json({ message: 'Error updating profile', error: innerError.message });
      }

    })
  } catch (outerError) {
    console.error('Error in updateMyProfile controller:', outerError.message);
    res.status(500).json({ message: 'Internal Server Error', error: outerError.message });
  }
}

export const updateProfile = async (req, res) => {
  try {
    const uploadMiddleware = upload.single('profilePic');
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: 'File upload error', error: err.message });
      }

      const userId = req.user._id; // Assumes `req.user` is populated via middleware
      const {
        firstName,
        lastName,
        gender,
        speciality,
        businessName,
        about,
        available,
        fees,
        address1,
        address2,
        phone,
        date,
        slots_booked,
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName) {
        return res.status(400).json({ message: 'First name and last name are required.' });
      }

      const updateData = {
        firstName,
        lastName,
        'professionalFields.speciality': speciality,
        'professionalFields.businessName': businessName,
        'professionalFields.about': about,
        'professionalFields.available': available,
        'professionalFields.fees': fees,
        'professionalFields.address1': address1,
        'professionalFields.address2': address2,
        'professionalFields.phone': phone,
        'professionalFields.date': date,
        'professionalFields.slots_booked': slots_booked,
      };

      try {
        // Handle profilePic upload
        const imageFile = req.file;
        if (imageFile) {
          const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
          updateData.profilePic = imageUpload.secure_url;
        }

        // Update user profile in the database
        const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true });

        if (!updatedUser) {
          return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(updatedUser);
      } catch (innerError) {
        console.error('Error during profile update:', innerError.message);
        res.status(500).json({ message: 'Error updating profile', error: innerError.message });
      }
    });
  } catch (outerError) {
    console.error('Error in updateProfile controller:', outerError.message);
    res.status(500).json({ message: 'Internal Server Error', error: outerError.message });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getProfessionals = async (req, res) => {
  try {
    const professionals = await User.find({ role: 'professional' }).select('-password');
    
    // const professionals = await User.getProfessionals()
    res.status(200).json(
      professionals.map((prof) => {
        const { userFields, ...otherFields } = prof.toObject();
        return {
          ...otherFields,
          ...prof.professionalFields, // Includes 'available'
        };
      })
    );
    // res.status(200).json(
    //   professionals.map((prof) => ({
    //     const { userFields, ...otherFields } = prof.toObject(),
    //     // ...professionals,
    //     _id: prof._id,
    //     email: prof.email,
    //     firstName: prof.firstName,
    //     lastName: prof.lastName,
    //     profilePic: prof.profilePic,
    //     speciality: prof.professionalFields.speciality,
    //     available: prof.professionalFields.available, 
    //     about: prof.professionalFields.about, 
    //     address1: prof.professionalFields.address1, 
    //     address2: prof.professionalFields.address2, 
    //     businessName: prof.professionalFields.businessName, 
    //     date: prof.professionalFields.date, 
    //     fees: prof.professionalFields.fees, 
    //     phone: prof.professionalFields.phone, 
    //     speciality: prof.professionalFields.speciality, 
    //     slots_booked: prof.professionalFields.slots_booked, 
    //   }))
    // );
    // res.status(200).json({ success: true, professionals });
  } catch (error) {
    console.log("Error in getProfessionals controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error('Error in getUsersForSidebar: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUserProfile: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}