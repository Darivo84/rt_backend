import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String, 
      required: true,
    },
    lastName: {
      type: String, 
      required: true,
    },
    password: {
      type: String, 
      required: true,
      minlength: 6,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
      required: true,
    },
    profilePic: {
      type: String,
      default: function () {
        const firstName = this.firstName || 'User'; // Fallback if firstName is missing
        return this.gender === 'Male'
          ? `https://avatar.iran.liara.run/public/boy?username=${firstName}`
          : `https://avatar.iran.liara.run/public/girl?username=${firstName}`;
      },
    },
    role: { 
      type: String, 
      enum: ['user', 'professional', 'admin'], 
      default: 'user' 
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },  
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    // Role-specific fields
    userFields: {
      dob: { type: String, default: '' },
      address1: { type: String, default: '' },
      address2: { type: String, default: '' },
      phone: { type: String, default: '0000000000' },
      idNumber: { type: Number, default: '0000000000' },
      occupation: { type: String, default: '' },
    },
    professionalFields: {
      speciality: { type: String, default: '' },
      businessName: { type: String, default: '' },
      about: { type: String, default: '' },
      available: { type: Boolean, default: true },
      fees: { type: Number, default: 0 },
      address1: { type: String, default: '' },
      address2: { type: String, default: '' },
      phone: { type: String, default: '0000000000' },
      date: { type: Number, default: 0 },
      slots_booked: { type: Object, default: {} },
    },
  },
  { timestamps: true }
);

userSchema.statics.getProfessionals = function () {
  return this.find({ role: 'professional' });
};

const User = mongoose.model("User", userSchema);

export default User;