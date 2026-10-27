const express = require("express");
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../Controllers/Category");
const { auth } = require("../Middlewares/auth");
const { isAdmin } = require("../Middlewares/role");
const upload = require("../Middlewares/upload");

const router = express.Router();

// public
router.get("/", getAllCategories);

// admin only
router.post("/", auth, isAdmin, upload.single("categoryImage"), createCategory);
router.put(
  "/:id",
  auth,
  isAdmin,
  upload.single("categoryImage"),
  updateCategory,
);
router.delete("/:id", auth, isAdmin, deleteCategory);

module.exports = router;
