const Listing = require("../models/listings.js");
const ExpressError = require("../utils/ExpressError.js");
const { geocodeLocation } = require("../utils/geocoding.js");

module.exports.index = async (req, res) => {
    const { category, search } = req.query;
    let filter = {};
    
    if (search) {
        filter = {
            $or: [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } }
            ]
        };
    } else if (category && category !== "popular") {
        filter = { category };
    }
    
    const allListings = await Listing.find(filter);
    const currentCategory = category || "popular";
    res.render("listings/index", { allListings, currentCategory, search });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }
    console.log("Showing listing:", listing);
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    // Remove the image field from body to avoid string conflict (multer puts filename as string there)
    delete req.body.listing.image;
    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    console.log("File received:", req.file);
    if (req.file) {
        newlisting.image = {
            filename: req.file.filename,
            url: req.file.path,
        };
        console.log("Image set:", newlisting.image);
    } else {
        console.log("No file uploaded");
    }
    try {
        const geometry = await geocodeLocation(newlisting.location, newlisting.country);
        newlisting.geometry = geometry;
    } catch (e) {
        newlisting.geometry = { type: "Point", coordinates: [0, 0] };
    }
    await newlisting.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    // Remove string image field from body to avoid conflict with Cloudinary
    delete req.body.listing.image;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true, runValidators: true });
    if (req.file) {
        listing.image = {
            filename: req.file.filename,
            url: req.file.path,
        };
    }
    try {
        const geometry = await geocodeLocation(listing.location, listing.country);
        listing.geometry = geometry;
    } catch (e) {
        listing.geometry = { type: "Point", coordinates: [0, 0] };
    }
    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("error", "Listing Deleted!");
    res.redirect("/listings");
};