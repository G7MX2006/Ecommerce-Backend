const express = require("express");

const {
  createOrder,
  getMyOrders,
  getmyOrderById,
  cancelOrder,
  GetAllOrders,
  GetOrderById,
  UpdateOrderStatus,
} = require("../Controllers/order");

const { auth } = require("../Middlewares/auth");

const { isAdmin } = require("../Middlewares/role");

const router = express.Router();

// User routes

router.post("/", auth, createOrder);

router.get("/", auth, getMyOrders);

router.get("/:id", auth, getmyOrderById);

router.patch("/:id/cancel", auth, cancelOrder);

// Admin routes

router.get("/admin/getOrders", auth, isAdmin, GetAllOrders);

router.get("/admin/getOrder/:id", auth, isAdmin, GetOrderById);

router.patch("/admin/updateOrderStatus/:id", auth, isAdmin, UpdateOrderStatus);

module.exports = router;
