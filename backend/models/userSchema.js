import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    minLength: [3, "Username must contain at least 3 characters."],
    maxLength: [40, "Username cannot exceed 40 characters."],
    required: true,
  },
  password: {
    type: String,
    select: false, // ✅ Fix confirmed
    minLength: [8, "Password must contain at least 8 characters."],
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  address: String,
  phone: {
    type: String,
    minLength: [11, "Phone number must contain exact 11 digits."],
    maxLength: [11, "Phone number must contain exact 11 digits."],
    required: true,
  },
  profileImage: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  paymentMethods: {
    bankTransfer: {
      bankAccountNumber: String,
      bankAccountName: String,
      bankName: String,
    },
    easypaisa: {
      easypaisaAccountNumber: String,
    },
    paypal: {
      paypalEmail: String,
    },
  },
  role: {
    type: String,
    enum: ["Auctioneer", "Bidder", "Super Admin"],
    required: true,
  },
  unpaidCommission: {
    type: Number,
    default: 0,
  },
  auctionsWon: {
    type: Number,
    default: 0,
  },
  moneySpent: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Compare password for login
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!enteredPassword) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Generate JWT Token (Fixed Key Reference)
userSchema.methods.generateJsonWebToken = function () {
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error("JWT_SECRET_KEY is missing in environment variables");
  }
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const User = mongoose.model("User", userSchema);
