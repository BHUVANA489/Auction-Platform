import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";

// ✅ Improved Registration with Cloudinary and Validation Fixes
export const register = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || !req.files.profileImage) {
    return next(new ErrorHandler("Profile Image Required.", 400));
  }

  const { profileImage } = req.files;

  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(profileImage.mimetype)) {
    return next(new ErrorHandler("File format not supported.", 400));
  }

  const {
    userName,
    email,
    password,
    phone,
    address,
    role,
    bankAccountNumber,
    bankAccountName,
    bankName,
    easypaisaAccountNumber,
    paypalEmail,
  } = req.body;

  // ✅ Improved Form Validation
  if (!userName || !email || !phone || !password || !address || !role) {
    return next(new ErrorHandler("Please fill full form.", 400));
  }

  if (role === "Auctioneer") {
    if (!bankAccountName || !bankAccountNumber || !bankName) {
      return next(
        new ErrorHandler("Please provide your full bank details.", 400)
      );
    }
    if (!easypaisaAccountNumber) {
      return next(
        new ErrorHandler("Please provide your Easypaisa account number.", 400)
      );
    }
    if (!paypalEmail) {
      return next(new ErrorHandler("Please provide your PayPal email.", 400));
    }
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("User already registered.", 400));
  }

  // ✅ Upload Profile Image to Cloudinary
  let cloudinaryResponse;
  try {
    cloudinaryResponse = await cloudinary.uploader.upload(
      profileImage.tempFilePath,
      {
        folder: "MERN_AUCTION_PLATFORM_USERS",
        resource_type: "image",
      }
    );
  } catch (error) {
    console.error("Cloudinary Error:", error);
    return next(
      new ErrorHandler("Failed to upload profile image to Cloudinary.", 500)
    );
  }

  // ✅ Create User in Database
  const user = await User.create({
    userName,
    email,
    password,
    phone,
    address,
    role,
    profileImage: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
    paymentMethods: {
      bankTransfer: {
        bankAccountNumber,
        bankAccountName,
        bankName,
      },
      easypaisa: {
        easypaisaAccountNumber,
      },
      paypal: {
        paypalEmail,
      },
    },
  });

  // ✅ Generate Token for Authentication
  generateToken(user, "User Registered Successfully.", 201, res);
});

// ✅ Improved Login Handling
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password.", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid credentials.", 400));
  }

  // ✅ Fix Password Comparison
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid credentials.", 400));
  }

  // ✅ Generate Token for Successful Login
  generateToken(user, "Login Successful.", 200, res);
});

// ✅ Get User Profile
export const getProfile = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated.", 401));
  }

  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// ✅ Logout with Proper Cookie Handling
export const logout = catchAsyncErrors(async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // ✅ Only secure in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Logout Successfully.",
  });
});

// ✅ Improved Leaderboard Fetching
export const fetchLeaderboard = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({ moneySpent: { $gt: 0 } }).sort({
    moneySpent: -1,
  });

  res.status(200).json({
    success: true,
    leaderboard: users,
  });
});
