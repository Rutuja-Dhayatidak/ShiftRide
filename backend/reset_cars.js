const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/car_rental";

mongoose.connect(mongoUri)
  .then(async () => {
    console.log("Connected to MongoDB");
    const db = mongoose.connection.db;

    // Update all cars to is_available: true
    const result = await db.collection("cars").updateMany(
      {},
      { $set: { is_available: true } }
    );

    console.log(`Successfully reset availability. Matched ${result.matchedCount} cars, updated ${result.modifiedCount} cars.`);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error("Error resetting cars:", err);
  });
