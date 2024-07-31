const express = require("express");
const router = express.Router({ mergeParams: true });
const WrapAsync = require("../utils/WrapAsync.js");
const {  listingSchema,reviewSchema } = require("../schema.js");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const flash = require("connect-flash")
const {isloggedin , isOwner , validateListing} = require("../middleware.js");
const ListingController = require("../controllers/listingController.js");
const multer  = require('multer');
const {storage} = require("../cloudconfig.js");
const upload = multer({storage})

// New listing form route
router.get("/new", isloggedin, ListingController.renderNewForm);

// Index route and create route
router
  .route("/")
  .get(WrapAsync(ListingController.index))
  .post(isloggedin, upload.single("listing[image]"),validateListing, WrapAsync(ListingController.createListing));
 
  

router
  .route("/:id")
  .get(WrapAsync(ListingController.showListing))
  .put(isloggedin, isOwner, upload.single("listing[image]"), ListingController.UpdateListing)
  .delete(isloggedin, isOwner, WrapAsync(ListingController.DeleteListing));

// Edit route
router.get("/:id/edit", isloggedin, isOwner, WrapAsync(ListingController.EditListing))

module.exports = router;












//old method



// // Index route
// router.get("/", WrapAsync(ListingController.index));
  
  
  
  // // Create route (POST)
  // router.post("/",isloggedin, validateListing, WrapAsync(ListingController.createListing));
  
  // // Show route
  // router.get("/:id", WrapAsync(ListingController.showListing));
  // Edit route
  // router.get("/:id/edit",isloggedin,isOwner, WrapAsync(ListingController.EditListing));
  
  // Update route (PUT)
  // router.put("/:id",isloggedin, validateListing, WrapAsync(async (req, res) => {
  //   const { id } = req.params;
  //   const listing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
  
  //   if (!listing) {
  //     req.flash("error","listing does not exists ")
  //    res.redirect("/listings");
  //   }
  //   req.flash("success","listing has been updated successfully");
  //   res.redirect(`/listings/${id}`);
  // }));
  // router.put('/:id',isloggedin,isOwner, ListingController.UpdateListing);
  
  // Delete route
  // router.delete("/:id",isloggedin,isOwner, WrapAsync(ListingController.DeleteListing));

