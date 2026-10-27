const WishlistModel = require("../Models/wishlistModel");
const ProductModel = require("../Models/productModel");

// add to wishlist
const addtowishlist = async (req, res) => {
  try {
    let productID = req.body.productID || req.body.productId;

    if (!productID) {
      return res.status(400).json({
        message: "productId must be provided",
      });
    }

    const existingProduct = await ProductModel.findById(productID);

    if (!existingProduct) {
      return res.status(404).json({
        message: "product not found",
      });
    }

    let wishlist = await WishlistModel.findOne({
      userId: req.id,
    });

    if (!wishlist) {
      wishlist = await WishlistModel.create({
        userId: req.id,
        products: [productID],
      });
    } else {
      let product = wishlist.products.find(
        (item) => item.toString() === productID,
      );

      if (product) {
        return res.status(400).json({
          message: "this product is already exist",
        });
      }

      wishlist.products.push(productID);

      await wishlist.save();
    }

    res.status(201).json({
      message: "product added to wishlist",
      wishlist,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getProductsOfWishlist = async (req, res) => {
  try {
    const wishlist = await WishlistModel.findOne({
      userId: req.id,
    }).populate({
      path: "products",
      populate: { path: "categoryId", select: "categoryName" }
    });

    if (!wishlist) {
      return res.status(200).json({
        message: "success",
        products: [],
      });
    }

    const validProducts = (wishlist.products || []).filter((item) => item !== null);

    res.status(200).json({
      message: "success",
      products: validProducts,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// remove from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const productID = req.params.productID || req.params.productId;

    if (!productID) {
      return res.status(400).json({
        message: "productId must be provided",
      });
    }

    const wishlist = await WishlistModel.findOne({
      userId: req.id,
    });

    if (!wishlist) {
      return res.status(404).json({
        message: "wishlist not found",
      });
    }

    wishlist.products = wishlist.products.filter(
      (item) => item.toString() !== productID,
    );

    await wishlist.save();

    res.status(200).json({
      message: "product removed from wishlist",
      wishlist,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  addtowishlist,
  getProductsOfWishlist,
  removeFromWishlist,
};
