const mongoose = require("mongoose");

const CategorySchema = mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: [true, "category name is required"],
      unique: true,
      trim: true,
    },
    categoryImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);
const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;
