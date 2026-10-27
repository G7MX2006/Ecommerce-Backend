const express = require("express");

const {
  createStock,
  getAllStock,
  getStockByProduct,
  updateStock,
} = require("../Controllers/Stock");

const { auth } = require("../Middlewares/auth");
const { isAdmin } = require("../Middlewares/role");

const router = express.Router();

// get all stock
router.get("/", getAllStock);

// get stock by product
router.get("/product/:productId", getStockByProduct);

// create stock
router.post("/", auth ,isAdmin, createStock);

// update stock
router.put("/:id", auth, isAdmin, updateStock);

module.exports = router;
