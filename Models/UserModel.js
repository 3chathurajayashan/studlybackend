// Models/UserModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
  country: { type: String, default: "Sri Lanka" }
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },

    password: { 
      type: String, 
      required: true,
      minlength: 6
    },

    role: { 
      type: String, 
      enum: ["instructor", "student", "admin"], 
      default: "student" 
    },

    phone: {
      type: String,
      trim: true
    },

    profilePicture: {
      type: String,
      default: null
    },

    dateOfBirth: {
      type: Date
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"]
    },

    address: addressSchema,

    isActive: {
      type: Boolean,
      default: true
    },

    // ✅ EMAIL VERIFICATION
    emailVerified: {
      type: Boolean,
      default: false
    },

    emailOTP: {
      type: String
    },

    emailOTPExpires: {
      type: Date
    },

    lastLogin: {
      type: Date
    },

    // 🔐 Password reset
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  { timestamps: true }
);



// 🔐 PASSWORD HASHING
// 🔐 PASSWORD HASHING
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// 🔑 COMPARE PASSWORD
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};


// 🔢 GENERATE OTP (4 digit)
userSchema.methods.generateEmailOTP = function () {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  this.emailOTP = otp;

  // ⏱ expires in 3 minutes
  this.emailOTPExpires = Date.now() + 3 * 60 * 1000;

  return otp;
};


// ✅ VERIFY OTP
userSchema.methods.verifyEmailOTP = function (enteredOTP) {
  if (
    this.emailOTP === enteredOTP &&
    this.emailOTPExpires > Date.now()
  ) {
    this.emailVerified = true;

    // clear OTP after success
    this.emailOTP = undefined;
    this.emailOTPExpires = undefined;

    return true;
  }

  return false;
};


const User = mongoose.model("User", userSchema);

export default User;