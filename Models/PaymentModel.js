const mongoose = require("mongoose");

const PaymentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    method: {
      type: String,
      enum: ["CASH", "CARD"],
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    transactionId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = Payment;
