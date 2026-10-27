const PaymentModel = require("../Models/PaymentModel");
const OrderModel = require("../Models/orderModel");
const StockModel = require("../Models/StockModel");
const CartModel = require("../Models/CartModel");

const axios = require("axios");

// create payment
const createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        message: "orderId must be provided",
      });
    }

    const order = await OrderModel.findOne({
      _id: orderId,
      userId: req.id,
    });

    if (!order) {
      return res.status(404).json({
        message: "order not found",
      });
    }

    if (order.paymentMethod !== "CARD") {
      return res.status(400).json({
        message: "this order does not require card payment",
      });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({
        message: "order is already paid",
      });
    }

    console.log(
      "Secret exists:",
      !!process.env.PAYMOB_SECRET_KEY
    );

    console.log(
      "Integration ID:",
      process.env.PAYMOB_INTEGRATION_ID
    );

    const response = await axios.post(
      "https://accept.paymob.com/v1/intention/",
      {
        amount: Math.round(order.totalPrice * 100),

        currency: "EGP",

        payment_methods: [
          Number(process.env.PAYMOB_INTEGRATION_ID),
        ],

        items: order.products.map((item) => ({
          name: item.productId.toString(),
          amount: Math.round(item.price * 100),
          quantity: item.quantity,
        })),

        billing_data: {
          first_name: "Customer",
          last_name: "Customer",
          email: "customer@example.com",
          phone_number: "01000000000",
          apartment: "NA",
          floor: "NA",
          street: "NA",
          building: "NA",
          shipping_method: "NA",
          postal_code: "NA",
          city: "Banha",
          state: "Qalyubia",
          country: "EG",
        },

        special_reference:
          order._id.toString(),

        notification_url:
          `${process.env.BACKEND_URL}/api/payment/webhook`,

        redirection_url:
          `${process.env.FRONTEND_URL}/payment-result`,
      },
      {
        headers: {
          Authorization:
            `Token ${process.env.PAYMOB_SECRET_KEY}`,

          "Content-Type":
            "application/json",
        },
      }
    );

    const payment =
      await PaymentModel.create({
        userId: req.id,
        orderId: order._id,
        amount: order.totalPrice,
        method: "CARD",
        status: "PENDING",
      });

    res.status(201).json({
      message: "payment created successfully",

      payment,

      client_secret:
        response.data.client_secret,

      public_key:
        process.env.PAYMOB_PUBLIC_KEY,
    });

  } catch (error) {
    console.log(
      error.response?.data ||
      error.message
    );

    res.status(400).json({
      message:
        error.response?.data ||
        error.message,
    });
  }
};


// Paymob webhook
const paymentWebhook = async (req, res) => {
  try {
    const transaction = req.body;

    const obj = transaction.obj;

    if (!obj) {
      return res.status(400).json({
        message: "invalid payment data",
      });
    }

    console.log(
      "Paymob Webhook:",
      obj
    );

    const ourOrderId =
      obj.order?.merchant_order_id ||
      obj.special_reference ||
      obj.order?.special_reference;

    if (!ourOrderId) {
      return res.status(400).json({
        message: "order reference not found",
      });
    }

    const order =
      await OrderModel.findById(
        ourOrderId
      );

    if (!order) {
      return res.status(404).json({
        message: "order not found",
      });
    }

    const payment =
      await PaymentModel.findOne({
        orderId: order._id,
      }).sort({
        createdAt: -1,
      });

    if (!payment) {
      return res.status(404).json({
        message: "payment not found",
      });
    }

    // payment success
    if (obj.success === true) {

      // prevent duplicate webhook
      if (payment.status === "PAID") {
        return res.status(200).json({
          message:
            "payment already processed",
        });
      }

      payment.status = "PAID";

      payment.transactionId =
        obj.id?.toString();

      await payment.save();

      order.paymentStatus = "PAID";
      order.status = "CONFIRMED";

      await order.save();

      // clear cart after successful payment
      console.log(
        "CLEARING CART FOR USER:",
        order.userId
      );

      await CartModel.findOneAndUpdate(
        { userId: order.userId },
        { $set: { products: [] } }
      );

      console.log("CART CLEARED");

      // update stock
      for (const item of order.products) {

        const stock =
          await StockModel.findOne({
            productId:
              item.productId,
          });

        if (!stock) {
          console.log(
            "Stock not found for product:",
            item.productId
          );

          continue;
        }

        stock.quantity =
          stock.quantity -
          item.quantity;

        if (stock.quantity <= 0) {

          stock.quantity = 0;

          stock.status =
            "out_of_stock";

        } else if (stock.quantity <= 5) {

          stock.status =
            "low_stock";

        } else {

          stock.status =
            "in_stock";
        }

        await stock.save();
      }

      return res.status(200).json({
        message:
          "payment processed successfully",
      });
    }

    payment.status = "FAILED";

    payment.transactionId =
      obj.id?.toString();

    await payment.save();

    return res.status(200).json({
      message: "payment failed",
    });

  } catch (error) {

    console.log(
      "Webhook Error:",
      error.message
    );

    res.status(500).json({
      message:
        "webhook processing failed",
    });
  }
};

module.exports = {
  createPayment,
  paymentWebhook,
};