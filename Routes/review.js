const express = require("express");
const router = express.Router({ mergeParams: true });
const WrapAsync = require("../utils/WrapAsync");
const ExpressError = require("../utils/ExpressError");
const ReviewController = require("../controllers/reviewController");
const { isloggedin, isReviewAuthor , validateReview } = require("../middleware");
const Review = require("../models/review");
const Listing = require("../models/listing");

// Review route
router.post("/", isloggedin, validateReview, WrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
    listing.review.push(newReview);  // Ensure 'reviews' field exists in Listing model
    await newReview.save();
    await listing.save();
    req.flash("success","new review added ");
    res.redirect(`/listings/${listing._id}`);
}));

// Delete review route
router.delete("/:reviewId", isloggedin, isReviewAuthor, WrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","review deleted successfully ");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;
