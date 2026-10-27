const express = require('express');
const { register, login, updatePassword, getProfile } = require('../Controllers/user');
const { auth } = require('../Middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.patch('/updatePassword', auth, updatePassword);
router.get('/profile', auth, getProfile);

module.exports = router;
