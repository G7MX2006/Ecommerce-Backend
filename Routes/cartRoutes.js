const express = require("express");
const {
  AddToCart,
  getProductsOfCart,
  removeFromCart,
  clearCart,
} = require("../Controllers/cart");
const { auth } = require("../Middlewares/auth");

const router = express.Router();

router.post("/cart", auth, AddToCart);
router.get("/cart", auth, getProductsOfCart);
router.delete("/cart", auth, clearCart);
router.delete("/cart/:productId", auth, removeFromCart);

module.exports = router;
