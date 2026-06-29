const mongoose = require("mongoose");
const Listing = require("../models/listings.js");
const User = require("../models/user.js");
require("dotenv").config();

const dburl = process.env.ATLAS_DBURL;

const oneMoreListing = {
  title: "Taj Palace in Mumbai",
  description: "Iconic 5-star hotel overlooking the Gateway of India with world-class amenities and sea views.",
  image: {
    filename: "listingimage",
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
  },
  price: 8000,
  location: "Mumbai",
  country: "India",
  category: "iconic-cities",
  geometry: { type: "Point", coordinates: [72.8347, 18.9219] }
};

async function run() {
  try {
    await mongoose.connect(dburl);
    console.log("✅ Connected to MongoDB");

    // Find the owner user "Rawal_Dixita"
    const owner = await User.findOne({ username: "Rawal_Dixita" });
    if (!owner) {
      console.error("❌ User 'Rawal_Dixita' not found in database!");
      console.log("   Available users:");
      const allUsers = await User.find({});
      allUsers.forEach(u => console.log(`   - "${u.username}" (${u.email})`));
      await mongoose.disconnect();
      return;
    }
    console.log(`✅ Found owner: Rawal_Dixita (ID: ${owner._id})`);

    // Step 1: Update ALL existing listings to have owner = Rawal_Dixita
    const updateResult = await Listing.updateMany(
      {}, // all listings
      { $set: { owner: owner._id } }
    );
    console.log(`🔄 Updated ${updateResult.modifiedCount} listings → owner changed to Rawal_Dixita`);

    // Step 2: Add the one new listing with owner = Rawal_Dixita
    const newListing = await Listing.create({
      ...oneMoreListing,
      owner: owner._id
    });
    console.log(`✅ Added new listing: "${newListing.title}" (₹${newListing.price}/night)`);

    // Step 3: Count total listings now
    const totalListings = await Listing.countDocuments();
    console.log(`\n📊 Total listings in database: ${totalListings}`);

    await mongoose.disconnect();
    console.log("\n🎉 Done! All listings now owned by Rawal_Dixita + 1 new listing added.");

  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err);
  }
}

run();