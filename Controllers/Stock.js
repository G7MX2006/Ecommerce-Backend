const StockModel = require("../Models/StockModel");
const socketManager = require("../socket");

// create stock
const createStock = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        message: "productId and quantity must be provided",
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        message: "quantity cannot be negative",
      });
    }

    const oldStock = await StockModel.findOne({
      productId,
    });

    if (oldStock) {
      return res.status(400).json({
        message: "stock already exists for this product",
      });
    }

    let status = "out_of_stock";

    if (quantity > 5) {
      status = "in_stock";
    } else if (quantity > 0) {
      status = "low_stock";
    }

    const stock = await StockModel.create({
      productId,
      quantity,
      status,
    });

    socketManager.emitEvent("stockUpdated", {
      productId: stock.productId,
      quantity: stock.quantity,
      status: stock.status,
      stock,
    });

    res.status(201).json({
      message: "stock created successfully",
      stock,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// get all stock
const getAllStock = async (req, res) => {
  try {
    const stock = await StockModel.find().populate(
      "productId",
      "productName productImage productPrice",
    );

    res.status(200).json({
      message: "success",
      stock,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// get stock by product
const getStockByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    const stock = await StockModel.findOne({
      productId,
    }).populate("productId", "productName productImage productPrice");

    if (!stock) {
      return res.status(404).json({
        message: "stock not found",
      });
    }

    res.status(200).json({
      message: "success",
      stock,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// update stock
const updateStock = async (req, res) => {
  try {
    const stockId = req.params.id;

    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        message: "quantity must be provided",
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        message: "quantity cannot be negative",
      });
    }

    let status = "out_of_stock";

    if (quantity > 5) {
      status = "in_stock";
    } else if (quantity > 0) {
      status = "low_stock";
    }

    const stock = await StockModel.findByIdAndUpdate(
      stockId,
      {
        quantity,
        status,
      },
      {
        new: true,
      },
    );

    if (!stock) {
      return res.status(404).json({
        message: "stock not found",
      });
    }

    socketManager.emitEvent("stockUpdated", {
      productId: stock.productId,
      quantity: stock.quantity,
      status: stock.status,
      stock,
    });

    res.status(200).json({
      message: "stock updated successfully",
      stock,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  createStock,
  getAllStock,
  getStockByProduct,
  updateStock,
};
