const Listing = require("../models/listings.js");
const Review = require("../models/reviews.js");

const isLoggedIn = (req, res, next) => {
    console.log(req.path,"..",req.originalUrl);
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to perform this action!");
        req.session.redirectUrl = req.originalUrl;
        return res.redirect("/signup");
    }
    next();
};

const saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

const isOwner = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }
    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        req.flash("error", "You do not have permission to edit this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

const isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }
    if (!review.author || !review.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to delete this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports = { isLoggedIn, saveRedirectUrl, isOwner, isReviewAuthor };
