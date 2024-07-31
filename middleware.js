const Listing = require("./models/listing");
const Review = require("./models/review");
const {  listingSchema,reviewSchema } = require("./schema.js");

module.exports.isloggedin = (req, res, next) => {
  if (!req.isAuthenticated()) {
      req.session.redirectUrl = req.originalUrl;
      req.flash("error", "You must be logged in to add new details");
      return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
      res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(errmsg, 400);
  } else {
    next();
  }
};
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(errmsg, 400);
  } else {
    next();
  }
};


module.exports.isOwner= async (req,res,next)=>{
  let {id}= req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error","You don't have permission to so");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
// module.exports.isReviewAuthor = async (req,res,next)=>{
//   let {id,Reviewid}= req.params;
//   let review = await Review.findById(Reviewid);
//   if (!review.author.equals(res.locals.currUser._id)) {
//     req.flash("error","You are not author of this review");
//     return res.redirect(`/listings/${id}`);
//   }
//   next();
// }
module.exports.isReviewAuthor = async (req, res, next) => {
  try {
      const { id, reviewId } = req.params;
      const review = await Review.findById(reviewId);

      if (!review) {
          req.flash("error", "Review not found");
          return res.redirect(`/listings/${id}`);
      }

      if (!review.author.equals(res.locals.currUser._id)) {
          req.flash("error", "You are not the author of this review");
          return res.redirect(`/listings/${id}`);
      }

      next();
  } catch (err) {
      req.flash("error", "Something went wrong");
      return res.redirect(`/listings/${id}`);
  }
};

