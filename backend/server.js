import cloudinary from "cloudinary";
import app from "./app.js";

// Ensure JWT secret is present or warn in development
if (!process.env.JWT_SECRET_KEY) {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ JWT_SECRET_KEY is missing in environment variables.");
    process.exit(1);
  } else {
    process.env.JWT_SECRET_KEY = "dev_default_jwt_secret_key_change_in_production";
    console.warn("⚠️ Warning: JWT_SECRET_KEY was not set. Using default development key.");
  }
} else {
  console.log("✅ JWT_SECRET_KEY loaded successfully.");
}

// Configure Cloudinary if credentials are provided
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("✅ Cloudinary configured successfully.");
} else {
  console.warn("⚠️ Cloudinary credentials missing in environment variables. Image uploads may fail.");
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
