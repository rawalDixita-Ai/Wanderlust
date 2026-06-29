const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review=require("./reviews.js");
const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        filename: {
            type: String,
            default: "listingimage",
        },
        url: {
            type: String,
            default:
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
        },
    },
    price: {
        type: Number,
        min: [0, "Price cannot be negative"],
    },
    location: String,
    country: String,
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        },
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",   
        },
    ],
    category: {
        type: String,
        enum: ["popular", "beach", "castle", "mountain", "amazing-pools", "iconic-cities"],
        default: "popular",
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
    await Review.deleteMany({_id:{$in: listing.reviews}});
    }
});
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;