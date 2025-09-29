const Listing = require("../models/listing");
const axios = require("axios");
const mapToken = process.env.MAP_TOKEN;

module.exports.index = async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listing/index.ejs",{allListings});
};


module.exports.renderNewForm = (req,res)=>{
    res.render("listing/newform.ejs");
};

module.exports.showListing = async (req,res)=>{                                  // common /listing removed from all routes.
    const {id} = req.params;
    const listing = await Listing.findById(id).populate({ path : "reviews", populate : {path : "author"}}).populate("owner");
    if(!listing){
       req.flash("error","Listing you requested for does not exist!");
       return res.redirect("/listing");
    }
    res.render("listing/showlisting.ejs",{listing});
};

module.exports.createListing = async (req,res)=>{

    // ---- Geocoding ----//
       let location = req.body.listing.location;
       const response = await axios.get(`https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json`, {
        params: {
            key: mapToken,
            limit: 1,
        },
        });

    // ---- Geocoding ----//

        let url = req.file.path;
        let filename = req.file.filename;
        let newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url,filename};
        newListing.geometry = response.data.features[0].geometry;   // Store Coordinates in geoJSON Format.
        let savedListing = await newListing.save();
        console.log(savedListing);
        req.flash("success","New Listing Created!");
        res.redirect("/listing");
};

module.exports.renderEditForm = async (req,res)=>{
   let {id} = req.params;
   let listing = await Listing.findById(id);
   if(!listing){
       req.flash("error","Listing you requested for does not exist!");
       return res.redirect("/listing");
   }
  
   let originalImageUrl = listing.image.url;
   originalImageUrl = originalImageUrl.replace("/upload","/upload/h_200,w_250")
   res.render("listing/editform.ejs",{listing,  originalImageUrl});
};

module.exports.updateListing = async (req,res)=>{
     let {id} = req.params;
     const updatedListing = await Listing.findByIdAndUpdate(id,{...req.body.listing});     // deconstructing object;

     if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        updatedListing.image = {url,filename};
        await updatedListing.save();
     }

     req.flash("success","Listing Updated!");
     res.redirect(`/listing/${id}`);
};

module.exports.destroyListing = async (req,res)=>{
   let {id} = req.params;
   let deletedlisting = await Listing.findByIdAndDelete(id);
   console.log(deletedlisting);
   req.flash("success","Listing Deleted!");
   res.redirect("/listing");
};