const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },

            quantity: {
                type: Number,
                required: true,
                min: 1
            },

            price: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],

    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },

    shippingAddress: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: [
            "PENDING",
            "CONFIRMED",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED"
        ],
        default: "PENDING"
    },

    paymentMethod: {
        type: String,
        enum: ["CASH", "CARD"],
        default: "CASH"
    },

    paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED"],
        default: "PENDING"
    }

}, {
    timestamps: true
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;