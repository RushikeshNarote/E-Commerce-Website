import mongoose from "mongoose";
import app from "./app.js";
import { config } from "./config.js";
import User from "./models/User.js";

try {
  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });
  console.info(
    `MongoDB connected: database="${mongoose.connection.name}", collection="${User.collection.name}".`,
  );
  app.listen(config.port, () => {
    console.log(`LEGENDS API listening on http://127.0.0.1:${config.port}`);
  });
} catch (error) {
  console.error("Could not start the LEGENDS API:", error.message);
  process.exitCode = 1;
}
