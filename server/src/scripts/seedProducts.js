import mongoose from "mongoose";
import { products } from "../../../client/src/data/products.js";
import { config } from "../config.js";
import Product from "../models/Product.js";

try {
  await mongoose.connect(config.mongoUri);
  const operations = products.map((product) => ({
    updateOne: {
      filter: { slug: product.id },
      update: {
        $set: {
          slug: product.id,
          number: product.number,
          name: product.name,
          colorway: product.colorway,
          description: product.description,
          image: product.image,
          demoPriceInr: product.demoPriceInr,
          availableSizes: product.availableSizes,
          unavailableSizes: product.unavailableSizes,
          accent: product.accent,
          active: true,
        },
      },
      upsert: true,
    },
  }));
  const result = await Product.bulkWrite(operations);
  console.log(
    `Product catalog synchronized (${result.upsertedCount} inserted, ${result.modifiedCount} updated). Demo prices are not commercial prices.`,
  );
} catch (error) {
  console.error("Could not seed the LEGENDS product catalog:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
