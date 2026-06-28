const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema}=require("../schema.js");
const { isLoggedIn, isOwner } = require("../utils/middleware.js");
const listingController=require("../controllers/listings.js");
const multer  = require('multer');
const{storage}=require("../cloudConfig.js");
const upload = multer({ storage});











const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//index route
router.get("/", wrapAsync(listingController.index));

//new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//show route
router.get("/:id", wrapAsync(listingController.showListing));

//create route
router.post("/", isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));
//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

//update route
router.put("/:id", isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing));

//destroy route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;
