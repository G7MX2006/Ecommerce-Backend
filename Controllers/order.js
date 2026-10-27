const orderModel = require("../Models/orderModel");
const cartModel = require("../Models/CartModel");
const ProductModel = require("../Models/productModel");
const StockModel = require("../Models/StockModel");
const socketManager = require("../socket");

function getStockStatus(quantity) {
  if (quantity > 5) {
    return "in_stock";
  }
  if (quantity > 0) {
    return "low_stock";
  }
  return "out_of_stock";
}

const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        message: "shipping address is required",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        message: "payment method is required",
      });
    }

    const cart = await cartModel
      .findOne({
        userId: req.id,
      })
      .populate("products.productId");

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({
        message: "cart is empty",
      });
    }

    let totalPrice = 0;

    const products = [];
    const stockUpdates = [];

    // Verify stock availability for each product
    for (let item of cart.products) {
      const product = item.productId;

      if (!product) {
        return res.status(404).json({
          message: "product not found",
        });
      }

      const stock = await StockModel.findOne({
        productId: product._id,
      });

      if (!stock) {
        return res.status(400).json({
          message: `stock not found for ${product.productName}`,
        });
      }

      // Prevent order creation if requested quantity exceeds available stock
      if (stock.quantity < item.quantity) {
        return res.status(400).json({
          message: `not enough stock for ${product.productName}`,
        });
      }

      const price = product.productPrice;

      totalPrice += price * item.quantity;

      products.push({
        productId: product._id,
        quantity: item.quantity,
        price: price,
      });

      stockUpdates.push({
        stock,
        quantity: item.quantity,
      });
    }

    const order = await orderModel.create({
      userId: req.id,
      products,
      totalPrice,
      shippingAddress,
      paymentMethod,
      paymentStatus: "PENDING",
      status: paymentMethod === "CASH" ? "CONFIRMED" : "PENDING",
    });

    // CASH: deduct stock and clear cart immediately
    if (paymentMethod === "CASH") {
      for (let update of stockUpdates) {
        update.stock.quantity = Math.max(
          0,
          update.stock.quantity - update.quantity,
        );
        update.stock.status = getStockStatus(update.stock.quantity);

        await update.stock.save();

        socketManager.emitEvent("stockUpdated", {
          productId: update.stock.productId,
          quantity: update.stock.quantity,
          status: update.stock.status,
        });
      }

      cart.products = [];

      await cart.save();
    }

    socketManager.emitEvent("orderCreated", order);

    res.status(201).json({
      message: "order created successfully",
      order,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({
        userId: req.id,
      })
      .populate("products.productId", "productName productImage productPrice");

    res.status(200).json({
      message: "success",
      orders,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getmyOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await orderModel
      .findOne({
        _id: orderId,
        userId: req.id,
      })
      .populate("products.productId", "productName productImage productPrice");

    if (!order) {
      return res.status(404).json({
        message: "order not found",
      });
    }

    res.status(200).json({
      message: "success",
      order,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await orderModel.findOne({
      _id: orderId,
      userId: req.id,
    });

    if (!order) {
      return res.status(404).json({
        message: "order not found",
      });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({
        message: "order cannot be cancelled",
      });
    }

    // Only restore stock if it was previously deducted (paid)
    if (order.paymentStatus === "PAID") {
      for (let item of order.products) {
        const stock = await StockModel.findOne({
          productId: item.productId,
        });

        if (stock) {
          stock.quantity += item.quantity;
          stock.status = getStockStatus(stock.quantity);
          await stock.save();
        }
      }
    }

    order.status = "CANCELLED";

    await order.save();

    socketManager.emitEvent("orderStatusUpdated", {
      orderId: order._id,
      status: order.status,
      order,
    });

    res.status(200).json({
      message: "order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// Get all orders (admin)
const GetAllOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .populate("userId", "firstname secondname email")
      .populate("products.productId", "productName productImage productPrice");

    res.status(200).json({
      message: "success",
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get order by id (admin)
const GetOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await orderModel
      .findById(orderId)
      .populate("userId", "firstname secondname email")
      .populate("products.productId", "productName productImage productPrice");

    if (!order) {
      return res.status(404).json({
        message: "order not found",
      });
    }

    res.status(200).json({
      message: "success",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const UpdateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        // check status
        if (status !== "SHIPPED" && status !== "DELIVERED") {
            return res.status(400).json({
                message: "invalid order status"
            });
        }

        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "order not found"
            });
        }

        // CONFIRMED -> SHIPPED
        if (status === "SHIPPED" && order.status !== "CONFIRMED") {
            return res.status(400).json({
                message: "order must be confirmed before shipping"
            });
        }

        // SHIPPED -> DELIVERED
        if (status === "DELIVERED" && order.status !== "SHIPPED") {
            return res.status(400).json({
                message: "order must be shipped before delivery"
            });
        }

        order.status = status;

        await order.save();

        socketManager.emitEvent("orderStatusUpdated", {
          orderId: order._id,
          status: order.status,
          order,
        });

        res.status(200).json({
            message: "order status updated successfully",
            order
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
  createOrder,
  getMyOrders,
  getmyOrderById,
  cancelOrder,
  GetAllOrders,
  GetOrderById,
  UpdateOrderStatus
};
