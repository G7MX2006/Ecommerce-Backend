const ProductModel = require("../Models/productModel");
const ReviewModel = require("../Models/reviewsModel");

const getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.find()
      .populate("categoryId", "categoryName")
      .lean();
    const reviews = await ReviewModel.find().lean();

    const reviewsMap = {};
    for (const r of reviews) {
      const pid = r.productId ? r.productId.toString() : "";
      if (!reviewsMap[pid]) {
        reviewsMap[pid] = [];
      }
      reviewsMap[pid].push(r.rating);
    }

    const productsWithRatings = products.map((prod) => {
      const ratings = reviewsMap[prod._id.toString()] || [];
      if (ratings.length > 0) {
        const sum = ratings.reduce((a, b) => a + b, 0);
        const avg = Number((sum / ratings.length).toFixed(1));
        return {
          ...prod,
          averageRating: avg,
          rating: avg,
          reviewCount: ratings.length,
        };
      } else {
        return {
          ...prod,
          averageRating: 0,
          rating: 0,
          reviewCount: 0,
        };
      }
    });

    res.status(200).json({
      message: "done",
      products: productsWithRatings,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const getProductByID = async (req, res) => {
  try {
    const productId = req.params.productId;

    const product = await ProductModel.findById(productId)
      .populate("categoryId", "categoryName")
      .lean();

    if (!product) {
      return res.status(404).json({
        message: "product not exist",
      });
    }

    const reviews = await ReviewModel.find({ productId }).lean();
    let averageRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((a, b) => a + b.rating, 0);
      averageRating = Number((sum / reviews.length).toFixed(1));
    }

    res.status(200).json({
      message: "successfully",
      product: {
        ...product,
        averageRating,
        rating: averageRating,
        reviewCount: reviews.length,
      },
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

const getproductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const products = await ProductModel.find({
      categoryId: categoryId,
    })
      .populate("categoryId", "categoryName")
      .lean();

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "products not founded",
      });
    }

    const reviews = await ReviewModel.find().lean();
    const reviewsMap = {};
    for (const r of reviews) {
      const pid = r.productId ? r.productId.toString() : "";
      if (!reviewsMap[pid]) {
        reviewsMap[pid] = [];
      }
      reviewsMap[pid].push(r.rating);
    }

    const productsWithRatings = products.map((prod) => {
      const ratings = reviewsMap[prod._id.toString()] || [];
      if (ratings.length > 0) {
        const sum = ratings.reduce((a, b) => a + b, 0);
        const avg = Number((sum / ratings.length).toFixed(1));
        return {
          ...prod,
          averageRating: avg,
          rating: avg,
          reviewCount: ratings.length,
        };
      } else {
        return {
          ...prod,
          averageRating: 0,
          rating: 0,
          reviewCount: 0,
        };
      }
    });

    res.status(200).json({
      message: "success",
      products: productsWithRatings,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { productName, productPrice, description, categoryId, productImage } =
      req.body;

    let image;

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else {
      image = productImage;
    }

    let product = await ProductModel.create({
      categoryId,
      productName,
      productPrice,
      description,
      productImage: image,
    });

    res.status(201).json({
      status: "success",
      product,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    const { productName, productPrice, description, productImage } = req.body;

    const product = await ProductModel.findByIdAndUpdate(
      productId,
      {
        productName,
        productPrice,
        description,
        productImage,
      },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({
        message: "product not exist",
      });
    }

    res.status(200).json({
      message: "product updated successfully",
      product,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    const product = await ProductModel.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({
        message: "product not exist",
      });
    }

    res.status(200).json({
      message: "product was removed",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductByID,
  getproductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
};