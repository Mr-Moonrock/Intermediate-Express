const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
const db = require('../db');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { authenticateJWT, 
        ensureLoggedIn, 
        ensureCorrectUser } = require('../middleware/auth')

const getUsers = async (req, res, next) => {
  try {
    const users = await User.all();
    res.json({ users });
  } catch (err) { 
    return next(err);
  }
}

const getUserByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.get(username);
    res.json({ user });
  } catch (err) {
    return next(err);
  }
}

const getMessagesToUser = async (req, res, next) => {
  try {
    const { username } = req.parms;
    const messages = await User.messagesTo(username);
    res.json({ messages });
  } catch (err) {
    return next(err)
  }
}

const getMessagesFromUser = async (req, res, next) => {
  try {
    const { username } = req.parms;
    const messages = await User.messagesFrom(username);
    res.json({ messages });
  } catch (err) {
    return next(err)
  }
}

module.exports = { getUsers, 
                  getUserByUsername, 
                  getMessagesToUser, 
                  getMessagesFromUser }