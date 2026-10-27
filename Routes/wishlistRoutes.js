const express = require("express");

const {
  addtowishlist,
  getProductsOfWishlist,
  removeFromWishlist,
} = require("../Controllers/wishlist");

const { auth } = require("../Middlewares/auth");

const router = express.Router();

router.post("/wishlist", auth, addtowishlist);

router.get("/wishlist", auth, getProductsOfWishlist);

router.delete("/wishlist/:productID", auth, removeFromWishlist);

module.exports = router;
