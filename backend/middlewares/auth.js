import { User } from "../models/userSchema.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "./error.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";


export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  // ✅ Fix token extraction from cookies and headers
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  console.log("Token received:", token); // ✅ Debugging

  if (!token) {
    return next(new ErrorHandler("User not authenticated.", 401));
  }

  try {
    // ✅ Ensure JWT_SECRET_KEY is defined
    if (!process.env.JWT_SECRET_KEY) {
      console.error("JWT_SECRET_KEY is missing in environment variables.");
      return next(new ErrorHandler("Internal server error.", 500));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorHandler("User not found.", 404));
    }

    next();
  } catch (error) {
    console.error("JWT Verification Failed:", error);

    // ✅ More specific JWT error handling
    if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Session expired. Please login again.", 401));
    } else if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler("Invalid token. Please login again.", 401));
    } else {
      return next(new ErrorHandler("Authentication failed.", 401));
    }
  }
});

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `${req.user?.role || "User"} not allowed to access this resource.`,
          403
        )
      );
    }
    next();
  };
};
