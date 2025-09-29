const User = require("../models/user");

module.exports.renderSignupForm = (req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.signup = async (req,res,next)=>{
  try{                                                         // for error handling if error occurs we flash error and we return on signup form itself
  let {username,email,password} = req.body;
  let newUser = new User({email,username});
  let registerdUser = await User.register(newUser,password);
  console.log(registerdUser);
  req.login(registerdUser, (err)=>{
    if(err){
      return next(err);
    }
    req.flash("success","Welcome to WanderLust!");
    res.redirect("/listing");    
   });
  }
  catch(e){
    req.flash("error",e.message);
    res.redirect("/signup")
  }
};


module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login =  async(req,res)=>{
    req.flash("success","Welcome Back to WanderLust!");
    const redirectUrl = res.locals.redirectUrl || "/listing";
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next)=>{
  req.logout((err)=>{
    if(err){
      return next(err);
    }
    req.flash("success","You are logged out!");
    res.redirect("/listing");
  });
};