const { response } = require("express");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const alllistings = await Listing.find({});
    res.render("listings/index", { alllistings });
  }

  module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
  }

  module.exports.createListing = async (req, res) => {
let response = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
      .send()

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing); // Ensure it accesses 'listing' within the body
    newListing.owner = req.user._id;
  newListing.image = {url,filename};
  newListing.geometry = response.body.features[0].geometry;
  let savelisting =  await newListing.save();
  console.log(savelisting);
    req.flash("success","New listing has been created");
    res.redirect("/listings");
  }

  module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "review",
            populate: { path: "author" }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
    }

    res.render("listings/show", { listing }); // Pass reviews array to template
}

module.exports.UpdateListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    }
     await listing.save();
    req.flash("success","listing has been updated successfully");
    res.redirect(`/listings/${id}`);
  };

module.exports.EditListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error","listing does not exists ")
     res.redirect("/listings");
    } 
    let ourl = listing.image.url;
   let OriginalUrl = ourl.replace("/upload" , "/upload/h_200,w_350");
    res.render("listings/edit", { listing ,OriginalUrl});
  }


// module.exports.UpdateListing = async (req, res) => {
//     const { id } = req.params;
//     const { listing } = req.body;

//     // Process the image field
//     const imageURL = req.body['listing[image.url]'];
//     const image = { url: imageURL };
//     const defaultImageURL = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
//     // Construct the updated listing object
//     const updateData = {
//         title: listing.title,
//         description: listing.description,
//         image: {
//           url: imageURL || defaultImageURL,
//       }, // Properly format the image field
//         price: listing.price,
//         location: listing.location,
//         country: listing.country
//     };

//     try {
//         const updatedListing = await Listing.findByIdAndUpdate(id, updateData, { new: true });
//         req.flash('success', 'Listing updated successfully!');
//         res.redirect(`/listings/${updatedListing._id}`);
//     } catch (err) {
//         req.flash('error', 'Failed to update listing');
//         res.redirect(`/listings/${id}/edit`);
//     }
// }

module.exports.DeleteListing =async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
      throw new ExpressError("Listing not found", 404);
    }
    req.flash("error","listing has been deleted successfully");
    res.redirect("/listings");
  }