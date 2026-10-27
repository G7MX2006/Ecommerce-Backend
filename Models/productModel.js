const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({

    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },

    productName: {
        type: String,
        required: [true, "this field is required"],
        minLength: [5, "productName at least 5 chars"],
        maxLength: [40, "productName at most 40 chars"],
        trim: true
    },

    productPrice: {
        type: Number,
        required: [true, "this field is required"],
        min: 100,
        max: 100000
    },

    description: {
        type: String,
        required: [true, "this field is required"],
        minLength: [20, "description at least 20 chars"],
        maxLength: [500, "description at most 500 chars"],
        trim: true
    },

    productImage: {
    type: String,
    default: "https://example.com/default-product.jpg"
}
}, {
    timestamps: true
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;