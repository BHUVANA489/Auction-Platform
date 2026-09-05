import express from "express";
import {
  fetchLeaderboard,
  getProfile,
  login,
  logout,
  register,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// ✅ User Registration
router.post("/register", register);

// ✅ User Login
router.post("/login", login);

// ✅ Get Profile (Authenticated Route)
router.get("/me", isAuthenticated, getProfile);

// ✅ Get Leaderboard
router.get("/leaderboard", fetchLeaderboard);

// ✅ Logout (Authenticated Route)
router.get("/logout", isAuthenticated, (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure for production
      sameSite: "none",
      path: "/",
    });
    res.status(200).json({
      success: true,
      message: "Logged Out Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
