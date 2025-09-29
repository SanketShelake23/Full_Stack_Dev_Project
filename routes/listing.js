const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");  // to handle async fun errors instead of try catch block.
const {listingSchema, reviewSchema} = require("../schema.js");  // for Joi
const ExpressError = require("../utils/ExpressError.js"); // to write custom error with statuscode and message.
const Listing = require("../models/listing.js"); // import Listing model to create documents from listing.js(models).
const {isLoggedIn, isOwner} = require("../middleware.js"); // Checks if user is logged in or not ?

const multer = require("multer");  // It is used to handle multipart/form-data that is used to upload the file.

const {storage} = require("../cloudConfig.js");  // Provides path to save files on cloud services.

const upload = multer({storage}); // {dest : path} => {storage} // to save files.

const listingController = require("../controllers/listing.js");

// Listing Routes :

//Joi tool (Listings) : for individual feild in schema validations.
const validateListing = (req,res,next) => {
   let {error} = listingSchema.validate(req.body);
   if(error){
    throw new ExpressError(400,error);
   }
   else{
      next();
   }
};


// Router route : combines different routes with same path and diiferent verbs like get,post,delete.

router
   .route("/")
   .get(wrapAsync(listingController.index)) // Index route
   .post(isLoggedIn, upload.single("listing[image]"),validateListing, wrapAsync(listingController.createListing)); // POST : save data in form in database


// 3] a) GET : Display form for create new listing.
router.get("/new", isLoggedIn, listingController.renderNewForm);   //  because /new creates confusion with /:id so write  it above /:id.


router
   .route("/:id")
   .get(wrapAsync(listingController.showListing)) //Read / Show route : show all details of individual listing.
   .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing)) //PUT : update edit info in DB (use method-override)
   .delete(isLoggedIn,  isOwner, wrapAsync(listingController.destroyListing)); //Delete route

//4] a) GET : render edit form for update.
router.get("/:id/edit",  isLoggedIn,  isOwner, wrapAsync(listingController.renderEditForm));


 module.exports = router;






//--------------------------------------------------------------------------------------------------------------------------------------------------

// Not used below style :

// 1] Index Route : GET /listing   : shows title of all listing as anchor tag by clicking on these we go to show route to view entire list.
//  router.get("/", wrapAsync(listingController.index));

// // 3] a) GET : Display form for create new listing.
//  router.get("/new", isLoggedIn, listingController.renderNewForm);

 // 2] Read / Show route : show all details of individual listing.
//  router.get("/:id", wrapAsync(listingController.showListing));   


 // 3] Create Route :
   // ** (NOT USED IN NORMALLY )a) GET : Display form for create new listing.
// **Not remove comments   app.get("/listing/new",(req,res)=>{                  because /new creates confusion with /:id so write  it above /:id.
// **    res.render("listing/newform.ejs");
// **   })

   // b) POST : save data in form in database :
   // router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));



// 4] Update Route :

//  // a) GET : render edit form for update.
//  router.get("/:id/edit",  isLoggedIn,  isOwner, wrapAsync(listingController.renderEditForm));

 // b) PUT : update edit info in DB (use method-override)
 //router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));


 // 5] Delete Route :
//  router.delete("/:id", isLoggedIn,  isOwner, wrapAsync(listingController.destroyListing));


//  module.exports = router;