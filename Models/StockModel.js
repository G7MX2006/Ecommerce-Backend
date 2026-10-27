
const mongoose = require('mongoose');

const StockSchema = mongoose.Schema({

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        unique: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },

    status: {
        type: String,
        enum: ["in_stock", "low_stock", "out_of_stock"],
        default: "out_of_stock"
    }

}, {
    timestamps: true
});

const Stock = mongoose.model("Stock", StockSchema);

module.exports = Stock;

