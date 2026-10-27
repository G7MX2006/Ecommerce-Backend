const express = require('express');
const {
  getAllProducts,
  getProductByID,
  getproductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../Controllers/product');
const { auth } = require('../Middlewares/auth');
const { isAdmin } = require('../Middlewares/role');
const upload = require("../Middlewares/upload")
const router = express.Router();


router.get('/', getAllProducts);
router.get('/category/:categoryId', getproductsByCategory);
router.get('/:productId', getProductByID);
router.post('/', auth, isAdmin, upload.single("productImage"), createProduct);
router.put('/:productId', auth, isAdmin, updateProduct);
router.delete('/:productId', auth, isAdmin, deleteProduct);

module.exports = router;
