const mongoose = require("mongoose");
const Listing = require("../models/listings.js");
require("dotenv").config();

const dburl = process.env.ATLAS_DBURL;

async function run() {
  try {
    await mongoose.connect(dburl);
    console.log("✅ Connected to MongoDB\n");

    const listings = await Listing.find({}).sort({ _id: -1 });
    console.log(`Total listings: ${listings.length}\n`);

    let problems = 0;
    listings.forEach((l, i) => {
      const hasImage = l.image && l.image.url;
      const url = hasImage ? l.image.url : "MISSING";
      console.log(`${i + 1}. "${l.title}"`);
      console.log(`   Price: ₹${l.price}, Category: ${l.category || "N/A"}`);
      console.log(`   Image URL: ${url}`);
      console.log(`   Owner: ${l.owner || "NONE"}`);
      
      if (!hasImage) {
        console.log("   ⚠️  PROBLEM: No image object at all!");
        problems++;
      } else if (!url.startsWith("http")) {
        console.log(`   ⚠️  PROBLEM: URL doesn't start with http: "${url}"`);
        problems++;
      } else {
        console.log(`   ✅ OK`);
      }
      console.log("");
    });

    console.log(`\n📊 Summary: ${listings.length} total, ${problems} with problems`);
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

run();