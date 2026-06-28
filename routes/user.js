const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const  passport=require("passport");

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        // Save redirectUrl BEFORE req.login() because passport regenerates the session
        let redirectUrl = req.session.redirectUrl || "/listings";
        delete req.session.redirectUrl;
        req.login(registeredUser, (err) => {
            if (err) {
                req.flash("error", "Something went wrong! Please log in manually.");
                return res.redirect("/login");
            }
            req.flash("success", "Welcome to WanderLust!");
            res.redirect(redirectUrl);
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
});
router.post("/login", async (req, res, next) => {
    // Save redirectUrl BEFORE passport.authenticate (which may regenerate the session)
    let redirectUrl = req.session.redirectUrl || "/listings";
    delete req.session.redirectUrl;
    passport.authenticate("local", (err, user, info) => {
        if (!user) {
            req.flash("error", info.message || "Invalid username or password!");
            return res.redirect("/login");
        }
        req.logIn(user, (err) => {
            if (err) {
                req.flash("error", "Something went wrong!");
                return res.redirect("/login");
            }
            req.flash("success", "Welcome back to WanderLust!");
            res.redirect(redirectUrl);
        });
    })(req, res, next);
});

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            req.flash("error", "Something went wrong! Could not log out.");
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
});

module.exports = router;