const express = require("express");

const router = express.Router();

const {
  GetAllUsers,
  GetUserById,
  DeleteUser,
  ChangeRole,
} = require("../Controllers/admin");

const { isAdmin } = require("../Middlewares/role");
const { auth } = require("../Middlewares/auth");

// get all users
router.get("/admin/getUsers", auth, isAdmin, GetAllUsers);

// get user by id
router.get("/admin/getUser/:id", auth, isAdmin, GetUserById);

// delete user
router.delete("/admin/deleteUser/:id", auth, isAdmin, DeleteUser);

// change user role
router.put("/admin/changeRole/:id", auth, isAdmin, ChangeRole);

// reviews management (admin)
const { getAllReviews, deleteReview } = require("../Controllers/review");
router.get("/admin/getReviews", auth, isAdmin, getAllReviews);
router.delete("/admin/deleteReview/:id", auth, isAdmin, deleteReview);

module.exports = router;
