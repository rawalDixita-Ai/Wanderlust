const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listings.js");
const User = require("../models/user.js");
require('dotenv').config();
const mongourl = process.env.ATLAS_DBURL || 'mongodb://127.0.0.1:27017/Wanderlust';

const initDB = async () => {
    await Listing.deleteMany({});

    // Find the user with this ObjectId to use as owner for all seeded listings
    const ownerId = "6a37ed8d0ecae9a9531339e4";
    let owner = await User.findById(ownerId);

    if (!owner) {
        console.log(`User with ID ${ownerId} not found. Creating a default user...`);
        owner = await User.register(
            new User({ username: "Dikshitha 12", email: "dikshitha12@demo.com" }),
            "password123"
        );
        console.log("Created default owner: Dikshitha 12 with ID:", owner._id);
    } else {
        console.log("Found existing owner:", owner.username);
    }

    // Add the real owner ID to every listing
    const dataWithOwner = initData.data.map((obj) => ({ ...obj, owner: owner._id }));
    await Listing.insertMany(dataWithOwner);
    console.log("data was initialized");
};

async function main() {
    await mongoose.connect(mongourl);
    await initDB();
};

main()
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log(err);
    });