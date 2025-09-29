const express = require("express");
const router = express.Router(); 
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/user.js");

//Signup :

// Using Router.route : combines routes with different verbs(get,post) and same path.

router
   .route("/signup")
   .get(userController.renderSignupForm)
   .post(wrapAsync(userController.signup));



//Login :

router
   .route("/login")
   .get(userController.renderLoginForm)
   .post(saveRedirectUrl,
    
    passport.authenticate("local",{ failureRedirect : "/login", failureFlash : true}),
    
    // Middleware that authenticates the user.    passport.authenticate(strategy, if failure then go to, flash failure message)
    
    userController.login
   );

// Logout :
router.get("/logout",userController.logout);


module.exports = router;