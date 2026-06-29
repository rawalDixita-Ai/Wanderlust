const mongoose = require("mongoose");
const Listing = require("../models/listings.js");
const User = require("../models/user.js");
require("dotenv").config();

const dburl = process.env.ATLAS_DBURL;

const newListings = [
  {
    title: "Sunset Villa in Goa",
    description: "Beautiful villa with private pool and stunning sunset views.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1615571022219-eb45cf7faa36?w=800"
    },
    price: 2500,
    location: "Goa",
    country: "India",
    category: "beach",
    geometry: { type: "Point", coordinates: [73.8567, 15.4909] }
  },
  {
    title: "Heritage Haveli in Jaipur",
    description: "Stay in a traditional Rajasthani haveli with royal architecture.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e?w=800"
    },
    price: 3200,
    location: "Jaipur",
    country: "India",
    category: "popular",
    geometry: { type: "Point", coordinates: [75.7873, 26.9124] }
  },
  {
    title: "Hill Station Cottage in Manali",
    description: "Cozy cottage surrounded by pine trees and snow-capped mountains.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?w=800"
    },
    price: 1800,
    location: "Manali",
    country: "India",
    category: "mountain",
    geometry: { type: "Point", coordinates: [77.1734, 32.2396] }
  },
  {
    title: "Beach Shack in Kerala",
    description: "Traditional houseboat experience in the backwaters of Kerala.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800"
    },
    price: 1500,
    location: "Kerala",
    country: "India",
    category: "beach",
    geometry: { type: "Point", coordinates: [76.2711, 10.8505] }
  },
  {
    title: "Luxury Suite in Mumbai",
    description: "Premium sea-facing apartment in the heart of Mumbai.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"
    },
    price: 4500,
    location: "Mumbai",
    country: "India",
    category: "iconic-cities",
    geometry: { type: "Point", coordinates: [72.8777, 19.0760] }
  },
  // --- 8 NEW LISTINGS BELOW ---
  {
    title: "Royal Palace Stay in Udaipur",
    description: "Experience royalty at a lakeside palace with breathtaking views of Lake Pichola.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1564759211144-cb0f01dc9c0b?w=800"
    },
    price: 5500,
    location: "Udaipur",
    country: "India",
    category: "popular",
    geometry: { type: "Point", coordinates: [73.6819, 24.5854] }
  },
  {
    title: "Tea Garden Bungalow in Darjeeling",
    description: "Wake up to misty tea gardens and panoramic Himalayan views from this charming bungalow.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"
    },
    price: 2200,
    location: "Darjeeling",
    country: "India",
    category: "mountain",
    geometry: { type: "Point", coordinates: [88.2667, 27.0417] }
  },
  {
    title: "Beach Resort in Andaman Islands",
    description: "Crystal clear waters, white sand beaches, and a private villa surrounded by palm trees.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"
    },
    price: 3800,
    location: "Andaman Islands",
    country: "India",
    category: "beach",
    geometry: { type: "Point", coordinates: [92.7500, 11.7500] }
  },
  {
    title: "Fort Suite in Jaisalmer",
    description: "Stay inside a living fort with sandstone architecture and desert views.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1585543805890-6051f7829f98?w=800"
    },
    price: 2800,
    location: "Jaisalmer",
    country: "India",
    category: "castle",
    geometry: { type: "Point", coordinates: [70.9127, 26.9157] }
  },
  {
    title: "Houseboat in Srinagar",
    description: "Luxurious houseboat on Dal Lake with traditional Kashmiri decor and shikara rides.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?w=800"
    },
    price: 3500,
    location: "Srinagar",
    country: "India",
    category: "amazing-pools",
    geometry: { type: "Point", coordinates: [74.7973, 34.0837] }
  },
  {
    title: "Penthouse in Bangalore",
    description: "Modern penthouse with infinity pool overlooking Bangalore's skyline.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"
    },
    price: 4000,
    location: "Bangalore",
    country: "India",
    category: "iconic-cities",
    geometry: { type: "Point", coordinates: [77.5946, 12.9716] }
  },
  {
    title: "Farm Stay in Punjab",
    description: "Experience authentic Punjabi culture with farm-fresh meals and lush green fields.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800"
    },
    price: 1200,
    location: "Amritsar",
    country: "India",
    category: "popular",
    geometry: { type: "Point", coordinates: [74.8723, 31.6340] }
  },
  {
    title: "Treehouse in Coorg",
    description: "Sleep among the coffee plantations in a luxury treehouse with misty mountain views.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1488462237308-ecaa28b729d7?w=800"
    },
    price: 2000,
    location: "Coorg",
    country: "India",
    category: "mountain",
    geometry: { type: "Point", coordinates: [75.7775, 12.3375] }
  }
];

async function run() {
  try {
    await mongoose.connect(dburl);
    console.log("✅ Connected to MongoDB");

    // Find the owner user
    const owner = await User.findOne({ username: "rawaldixita_12" });
    if (!owner) {
      console.error("❌ User 'rawaldixita_12' not found in database!");
      console.log("   Available users:");
      const allUsers = await User.find({});
      allUsers.forEach(u => console.log(`   - ${u.username} (${u.email})`));
      await mongoose.disconnect();
      return;
    }
    console.log(`✅ Found owner: rawaldixita_12 (ID: ${owner._id})`);

    // Delete any existing listings that have no owner (created by forgotten accounts)
    const deleted = await Listing.deleteMany({ owner: { $exists: false } });
    if (deleted.deletedCount > 0) {
      console.log(`🗑️  Deleted ${deleted.deletedCount} orphaned listings (no owner)`);
    }

    // Delete any existing listings that have the wrong owner (not rawaldixita_12)
    // Comment this out if you want to keep existing ones
    // const deletedOther = await Listing.deleteMany({ owner: { $ne: owner._id } });
    // if (deletedOther.deletedCount > 0) {
    //   console.log(`🗑️  Deleted ${deletedOther.deletedCount} listings owned by other users`);
    // }

    // Add owner to all new listings
    const listingsWithOwner = newListings.map(listing => ({
      ...listing,
      owner: owner._id
    }));

    // Insert all 13 listings
    const result = await Listing.insertMany(listingsWithOwner);
    console.log(`✅ Successfully added ${result.length} listings with owner 'rawaldixita_12':`);
    result.forEach((listing, i) => {
      console.log(`   ${i + 1}. ${listing.title} (₹${listing.price}/night) - ${listing.category}`);
    });

    await mongoose.disconnect();
    console.log("\n🎉 Done! All 13 listings are now on your website with rawaldixita_12 as owner.");
    console.log("   You can now edit/delete them when logged in as rawaldixita_12.");

  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err);
  }
}

run();