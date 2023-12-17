const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
const User = require('../models/user');
const { ensureLoggedIn } = require('../middleware/auth')
const { 
  getUsers, 
  getUserByUsername, 
  getMessagesToUser, 
  getMessagesFromUser 
} = require('../controllers/users');


// user routes 
router.get('/', ensureLoggedIn, getUsers)

router.get('/users/:username', ensureLoggedIn, getUserByUsername)

router.get('/:username', ensureLoggedIn, getMessagesToUser)

router.get('/:username/from', ensureLoggedIn, getMessagesFromUser); 

module.exports = router;