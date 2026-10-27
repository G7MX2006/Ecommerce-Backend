const ReviewModel = require("../Models/reviewsModel");
const OrderModel = require("../Models/orderModel");
const socketManager = require("../socket");

const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        message: "productId, rating and comment must be provided",
      });
    }

    const order = await OrderModel.findOne({
      userId: req.id,
      status: "DELIVERED",
      "products.productId": productId,
    });

    if (!order) {
      return res.status(400).json({
        message: "you can review only products you purchased and received",
      });
    }

    const oldReview = await ReviewModel.findOne({
      userId: req.id,
      productId,
    });

    if (oldReview) {
      return res.status(400).json({
        message: "you already reviewed this product",
      });
    }

    const review = await ReviewModel.create({
      userId: req.id,
      productId,
      rating,
      comment,
    });

    const populatedReview = await ReviewModel.findById(review._id).populate(
      "userId",
      "firstname secondname"
    );

    socketManager.emitEvent("reviewAdded", {
      productId,
      review: populatedReview || review,
    });

    res.status(201).json({
      message: "review created successfully",
      review,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getReviewsByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    const reviews = await ReviewModel.find({
      productId,
    }).populate("userId", "firstname secondname");

    res.status(200).json({
      message: "success",
      reviews,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getReviewById = async (req, res) => {
  try {
    const reviewId = req.params.id;

    const review = await ReviewModel.findById(reviewId).populate(
      "userId",
      "firstname secondname",
    );

    if (!review) {
      return res.status(404).json({
        message: "review not found",
      });
    }

    res.status(200).json({
      message: "success",
      review,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    const { rating, comment } = req.body;

    const review = await ReviewModel.findOneAndUpdate(
      {
        _id: reviewId,
        userId: req.id,
      },
      {
        rating,
        comment,
      },
      {
        new: true,
      },
    );

    if (!review) {
      return res.status(404).json({
        message: "review not found",
      });
    }

    res.status(200).json({
      message: "review updated successfully",
      review,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await ReviewModel.find()
      .populate("userId", "firstname secondname email")
      .populate("productId", "productName productImage productPrice")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "success",
      reviews,
      numberOfReviews: reviews.length,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    const query = { _id: reviewId };
    if (req.role !== "admin") {
      query.userId = req.id;
    }

    const review = await ReviewModel.findOneAndDelete(query);

    if (!review) {
      return res.status(404).json({
        message: "review not found",
      });
    }

    res.status(200).json({
      message: "review deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const canUserReviewProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        message: "productId must be provided",
      });
    }

    const existingReview = await ReviewModel.findOne({
      userId: req.id,
      productId,
    });

    if (existingReview) {
      return res.status(200).json({
        canReview: false,
        reason: "ALREADY_REVIEWED",
        message: "You have already reviewed this product.",
      });
    }

    const deliveredOrder = await OrderModel.findOne({
      userId: req.id,
      status: "DELIVERED",
      "products.productId": productId,
    });

    if (!deliveredOrder) {
      return res.status(200).json({
        canReview: false,
        reason: "NOT_DELIVERED",
        message: "You can only review products that have been delivered to you.",
      });
    }

    return res.status(200).json({
      canReview: true,
      message: "You are eligible to review this product.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewsByProduct,
  getReviewById,
  updateReview,
  deleteReview,
  canUserReviewProduct,
};
