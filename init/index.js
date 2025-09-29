const mongoose = require("mongoose");
const initData = require("./data.js");

const Listing = require("../models/listing.js");

main()
.then((res)=> console.log("Connection is Successful"))
.catch((err)=> console.log(err));

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=> ({...obj, owner : "68d375d982774e444086f22f"}));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized.");
};

initDB();