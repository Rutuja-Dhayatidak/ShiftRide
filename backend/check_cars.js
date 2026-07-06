const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/car_rental";

mongoose.connect(mongoUri)
  .then(async () => {
    const db = mongoose.connection.db;
    const cars = await db.collection("cars").find({}).toArray();
    console.log("CAR AVAILABILITY STATUS:");
    for (let car of cars) {
      console.log(`- Name: ${car.name || car.model_name}`);
      console.log(`  is_active: ${car.is_active}`);
      console.log(`  is_available: ${car.is_available}`);
      console.log(`  Type of is_available: ${typeof car.is_available}`);
    }
    mongoose.disconnect();
  });
