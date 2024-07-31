
const mongoose = require("mongoose");
const Review = require("./review.js");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
       url:String,
       filename:String,
    },
    price: {
        type: Number,
        min: 0,
    },
    location: String,
    country: String,
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    review:[
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      }
});

listingSchema.post("findOneAndDelete" , async(listing)=>{
    if(Listing){
    await Review.deleteMany({_id:{$in:listing.reviews}})
    }
})


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;




// const mongoose = require("mongoose")
// const schema = mongoose.Schema;

// const listingschema = new schema({
//     title: {
//         type: String,
//         required: true,
//     },
//     description: String,
//     image:{
//         type: String,
//         default:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//         set: (v) => v===""?"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D":v,
//     },
//     price: Number,
//     location: String,
//     country:String,
// });
// const Listing = mongoose.model("Listing",listingschema)
// module.exports = Listing;

