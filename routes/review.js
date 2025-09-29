const express = require("express");
const router = express.Router({mergeParams : true}); // to use :id of listings in common path in these file.
const wrapAsync = require("../utils/wrapAsync.js");  // to handle async fun errors instead of try catch block.
const ExpressError = require("../utils/ExpressError.js"); // to write custom error with statuscode and message.
const {listingSchema, reviewSchema} = require("../schema.js");
const Review = require("../models/review.js"); // import review model
const Listing = require("../models/listing.js"); // import Listing model to create documents from listing.js(models).
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/review.js");


// Joi tool (Reviews)
const validateReview = (req,res,next)=>{
   let {error} = reviewSchema.validate(req.body);
   if(error){
      throw new ExpressError(400,error);
   }
   else{
      next();
   }
};

// Reviews :

 // 1] Add Review : Post Route
 router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// 2] delete Review : Delete Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;