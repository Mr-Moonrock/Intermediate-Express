const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth')
const { authenticateJWT } = require('../middleware/auth')

//auth routes 
router.post('/resgister', authController.registerUser);

router.post('/login', authController.loginUser); 

module.exports = router;