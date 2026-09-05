import mongoose from "mongoose";
import dns from "dns";

// Helper to check DB connection status
export const isDbConnected = () => mongoose.connection.readyState === 1;

export const connection = async () => {
  const primaryUri =
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/MERN_AUCTION_PLATFORM";
  const localFallbackUri = "mongodb://127.0.0.1:27017/MERN_AUCTION_PLATFORM";

  const connectWithOptions = async (uri) => {
    return mongoose.connect(uri, {
      dbName: "MERN_AUCTION_PLATFORM",
      serverSelectionTimeoutMS: 5000,
    });
  };

  try {
    // Attempt connecting to the configured URI
    await connectWithOptions(primaryUri);
    console.log("✅ Connected to database successfully.");
  } catch (err) {
    console.error(`\n❌ Could not connect to primary MongoDB URI: ${err.message}`);

    // If using MongoDB Atlas (+srv), try resolving with public DNS (8.8.8.8, 1.1.1.1) in case of local ISP DNS issues
    if (primaryUri.includes("mongodb+srv://")) {
      try {
        console.log("🔄 Retrying Atlas connection with public DNS resolvers (8.8.8.8, 1.1.1.1)...");
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        await connectWithOptions(primaryUri);
        console.log("✅ Connected to MongoDB Atlas using public DNS resolvers.");
        return;
      } catch (retryErr) {
        console.error(`❌ Atlas connection failed with public DNS: ${retryErr.message}`);
      }

      console.log("\n📋 MongoDB Atlas Troubleshooting Tips:");
      console.log("  1. Verify the cluster URL in your config.env (Cluster names change if deleted/recreated).");
      console.log("  2. In MongoDB Atlas, go to Network Access -> Add IP Address -> Select 'Allow Access From Anywhere' (0.0.0.0/0).");
      console.log("  3. Verify database username and password in Database Access (URL-encode special characters like @ or #).");
    }

    // Try fallback to local MongoDB if primary was not local
    if (primaryUri !== localFallbackUri) {
      try {
        console.log(`\n🔄 Attempting fallback connection to local MongoDB (${localFallbackUri})...`);
        await connectWithOptions(localFallbackUri);
        console.log("✅ Connected to fallback local MongoDB successfully. The app is ready to use!");
        return;
      } catch (fallbackErr) {
        console.error(`❌ Fallback to local MongoDB also failed: ${fallbackErr.message}`);
      }
    }

    console.log("\n⚠️ To fix database connection:");
    console.log("  - For MongoDB Atlas: paste your new connection string into backend/config/config.env under MONGO_URI.");
    console.log("  - For Local MongoDB: make sure MongoDB service is running and set MONGO_URI=mongodb://127.0.0.1:27017/MERN_AUCTION_PLATFORM\n");
  }
};
