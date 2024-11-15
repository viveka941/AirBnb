const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  images: {
    type: String,
    default:
      "https://www.pexels.com/photo/woman-wearing-white-pink-and-green-floral-dress-holding-pink-bougainvillea-flowers-206557/",
    set: (v) =>
      v === ""
        ? "https://www.pexels.com/photo/woman-wearing-white-pink-and-green-floral-dress-holding-pink-bougainvillea-flowers-206557/"
        : v,
  },
  price: Number,
  location: String,
  country: String,
  review: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
