if(process.env.NODE_ENV != "production"){
    require("dotenv").config();              // For Load Environment Variables :
}                                         


const express = require("express");
const app = express();

const mongoose = require("mongoose");

const Listing = require("./models/listing.js"); // import Listing model to create documents from listing.js(models).

const path = require("path");  // for views directory.

const methodOverride = require("method-override");     // for PUT/DELETE Request.

const ejsMate = require("ejs-mate");       // to write layouts that appears in all pages like navbar.

const wrapAsync = require("./utils/wrapAsync.js");  // to handle async fun errors instead of try catch block.
const ExpressError = require("./utils/ExpressError.js"); // to write custom error with statuscode and message.
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review.js"); // import review model

const listingRouter = require("./routes/listing.js");  // for listing routes.
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");   // to create a session_id and store session information by default on local storage.
const MongoStore = require("connect-mongo");  // to create mongo session store

const { date } = require("joi");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const dbUrl = process.env.ATLASDB_URL;     // To deploy databse on Atlas DB

main()
.then((res)=> console.log("Connection is Successful"))
.catch((err)=> console.log(err));

async function main(){
 // await mongoose.connect("our url");   // : To connect with local host.
    await mongoose.connect(dbUrl);  //: To Connect with database on cloud service(Mongo Atlas).
}


app.set("views",path.join(__dirname,"views"));      // setup location of views.
app.set("view engine","ejs");                       // setup ejs templates.

app.use(express.urlencoded({extended : true}));     // to parse request data.

app.use(methodOverride("_method"));         // for put/delete request.

app.engine("ejs", ejsMate);    // for including layouts in ejs templates.

app.use(express.static(path.join(__dirname,"public")));


//Session 

//create mongo store to save sessions after hosting db.
const store = MongoStore.create({
   mongoUrl : dbUrl,   // stores session on mongo atlas. // write //mongodburl.. for local host use.
   crypto : {
     secret : process.env.SECRET 
   },
   touchAfter : 24*60*60,   // update after 24 hours.
});

store.on("error",()=>{console.log("Error on Mongo Session Store!",error)});

const sessionOptions = {
    store : store,           // location to store sessions.
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000, // cookies expires after 1 week in miliseconds.
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,                                // to avoid cross-scripting attacks.
    }
};


// app.get("/",(req,res)=>{
//     res.send("Hello , I am root !!");
// })


app.use(session(sessionOptions));
app.use(flash());

// Passport always implement after session. because we need to maintain login in whole session.
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());        // To store user info in session.
passport.deserializeUser(User.deserializeUser());   // To remove user info from session.


app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});



// Demo User :
// app.get("/demouser",async (req,res)=>{
//   let fakeUser = new User({
//     email : "student21@gmail.com", // from schema
//     username : "John21",           // from local-mongoose
//   });

//   let registeredUser = await User.register(fakeUser,"HelloWorld");
//   res.send(registeredUser);
// });

// check listing model :
// app.get("/checklisting",(req,res)=>{
//   const samplelisting = new Listing({
//     title : "My new Villa",
//     description : "near and off the beach",
//     price : 5000,
//     location : "Caliguit, Goa",
//     country : "India",
//   });

//   samplelisting.save()
//   .then((res)=>console.log(res))
//   .catch((err)=> console.log(err));

//   res.send("Listing is saved.");
// });

// Joi tool (Listings) : for individual feild in schema validations.       **Placed in listing.js(routes) for listing routes.
// const validateListing = (req,res,next) => {
//    let {error} = listingSchema.validate(req.body);
//    if(error){
//     throw new ExpressError(400,error);
//    }
//    else{
//       next();
//    }
// };

// // Joi tool (Reviews)                                                  **Placed in review.js(routes) for review routes.
// const validateReview = (req,res,next)=>{
//    let {error} = reviewSchema.validate(req.body);
//    if(error){
//       throw new ExpressError(400,error);
//    }
//    else{
//       next();
//    }
// };

//--------------------------------------------------------------------------------------

// 1] Listing Routes :
app.use("/listing",listingRouter);    // matches common path ("/listing") in all listings in listing.js(routes)

//--------------------------------------------------------------------------------------

// 2] Review Routes :
app.use("/listing/:id/reviews",reviewRouter); // matches common path ("/listing/:id/reviews") in all reviews in review.js(routes)
 
//--------------------------------------------------------------------------------------

// 3] User Routes :
app.use("/",userRouter); 
 
//--------------------------------------------------------------------------------------


 // To handle Invalid routes :
 app.use((req, res, next) => {
    // This middleware runs only if no route matched
    const err = new ExpressError(404, "Page is Not Found!");
    next(err); // Pass error to the error-handling middleware
});

// for error handling we define middleware :
app.use((err,req,res,next)=>{
   let {statusCode=500, message= "Something went wrong"} = err;
   res.status(statusCode).render("error.ejs",{message});
});


app.listen(8080,()=>{
    console.log("app is listening on port 8080");
})