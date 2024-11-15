const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  images: {
    type: String,
    default:
      "https://images.pexels.com/photos/297984/pexels-photo-297984.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    set: (v) =>
      v === ""
        ? "https://images.pexels.com/photos/297984/pexels-photo-297984.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
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
