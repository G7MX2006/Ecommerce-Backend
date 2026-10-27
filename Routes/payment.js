const express = require("express");

const {
    createPayment,
    paymentWebhook
} = require("../Controllers/Payment");

const { auth } = require("../Middlewares/auth");

const router = express.Router();

router.post(
    "/payment",
    auth,
    createPayment
);

router.post(
    "/payment/webhook",
    (req, res, next) => {
        console.log("🔥 PAYMENT ROUTE RECEIVED");
        next();
    },
    paymentWebhook
);

module.exports = router;