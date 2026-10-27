const CategoryModel = require("../Models/CategoryModel");

const createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName) {
      return res.status(400).json({
        message: "category name must be provided",
      });
    }

    let category = await CategoryModel.findOne({ categoryName });

    if (category) {
      return res.status(400).json({
        message: "category name is already exist",
      });
    }

    let image;

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const savedCategory = await CategoryModel.create({
      categoryName,
      categoryImage: image,
    });

    res.status(201).json({
      message: "success",
      savedCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find();

    res.status(200).json({
      message: "success",
      categories,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getCategoryByID = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await CategoryModel.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        message: "category not found",
      });
    }

    res.status(200).json({
      message: "success",
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const { categoryName } = req.body;

    if (!categoryName) {
      return res.status(400).json({
        message: "category name must be provided",
      });
    }

    let category = await CategoryModel.findOne({ categoryName });

    if (category && category._id.toString() !== categoryId) {
      return res.status(400).json({
        message: "category name is already exist",
      });
    }

    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      categoryId,
      {
        categoryName,
        ...(req.file && { categoryImage: `/uploads/${req.file.filename}` }),
      },
      { new: true },
    );

    if (!updatedCategory) {
      return res.status(404).json({
        message: "category not found",
      });
    }

    res.status(200).json({
      message: "category updated successfully",
      updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const deletedCategory = await CategoryModel.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res.status(404).json({
        message: "category not found",
      });
    }

    await ProductModel.updateMany(
      { categoryId: categoryId },
      { $set: { categoryId: null } },
    );

    res.status(200).json({
      message: "category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryByID,
  updateCategory,
  deleteCategory,
};
