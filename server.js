const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./Routes/userRoutes");
const categoryRoutes = require("./Routes/categoryRoutes");
const productRoutes = require("./Routes/productRoutes");
const cartRoutes = require("./Routes/cartRoutes");
const orderRoutes = require("./Routes/orderRoutes");
const reviewRoutes = require("./Routes/reviewRoutes");
const wishlistRoutes = require("./Routes/wishlistRoutes");
const stockRoutes = require("./Routes/stockRoutes");
const paymentRoutes = require("./Routes/payment");
const AdminRoutes = require("./Routes/adminRoutes")
const http = require("http");
const socketManager = require("./socket");

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketManager.init(server);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/users", userRoutes);
app.use("/api/user", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api", wishlistRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api", paymentRoutes);
app.use("/api",AdminRoutes)
mongoose
  .connect("mongodb://127.0.0.1:27017/myDatabase")
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.log("Database connection failed");
    console.log(error);
  });

server.listen(3000, () => {
  console.log("Server is working on port 3000 with Socket.io enabled");
});
