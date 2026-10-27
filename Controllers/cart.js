const cartModel = require("../Models/CartModel");
const ProductModel = require("../Models/productModel");

const AddToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "productId must be provided",
      });
    }

    const existingProduct = await ProductModel.findById(productId);

    if (!existingProduct) {
      return res.status(404).json({
        message: "product not found",
      });
    }

    let cart = await cartModel.findOne({
      userId: req.id,
    });

    if (!cart) {
      cart = await cartModel.create({
        userId: req.id,
        products: [
          {
            productId,
            quantity: quantity || 1,
          },
        ],
      });
    } else {
      let product = cart.products.find(
        (item) => item.productId.toString() === productId,
      );

      if (product) {
        product.quantity += quantity || 1;
      } else {
        cart.products.push({
          productId,
          quantity: quantity || 1,
        });
      }

      await cart.save();
    }

    res.status(201).json({
      message: "product added to cart",
      cart,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getProductsOfCart = async (req, res) => {
  try {
    const cart = await cartModel
      .findOne({
        userId: req.id,
      })
      .populate("products.productId", "productName productImage productPrice");

    if (!cart) {
      return res.status(200).json({
        message: "success",
        cart: {
          userId: req.id,
          products: [],
        },
      });
    }

    res.status(200).json({
      message: "success",
      cart,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const productId = req.params.productId;

    if (!productId) {
      return res.status(400).json({
        message: "productId must be provided",
      });
    }

    const cart = await cartModel.findOne({
      userId: req.id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "cart not found",
      });
    }

    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    res.status(200).json({
      message: "product removed from cart",
      cart,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const clearCart = async (req, res) => {
  try {
    let cart = await cartModel.findOne({
      userId: req.id,
    });

    if (cart) {
      cart.products = [];
      await cart.save();
    } else {
      cart = await cartModel.create({
        userId: req.id,
        products: [],
      });
    }

    res.status(200).json({
      message: "cart cleared successfully",
      cart,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  AddToCart,
  getProductsOfCart,
  removeFromCart,
  clearCart,
};
