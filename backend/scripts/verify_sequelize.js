require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { sequelize } = require("../src/config/db");
const models = require("../src/models/index");

async function verify() {
  try {
    console.log("Starting Sequelize verification...");
    
    // Test connection
    await sequelize.authenticate();
    console.log("✅ Sequelize connection successful.");

    // Sync models
    await sequelize.sync({ alter: false });
    console.log("✅ Sequelize synchronization successful.");

    // Test a query (e.g., list users or cars)
    const userCount = await models.User.count();
    console.log(`✅ Found ${userCount} users in the database.`);

    const carCount = await models.Car.count();
    console.log(`✅ Found ${carCount} cars in the database.`);

    console.log("🚀 Verification COMPLETED SUCCESSFULLY!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Verification FAILED:", error.message);
    process.exit(1);
  }
}

verify();
