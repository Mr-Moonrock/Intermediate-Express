const User = require('../models/user');
const ExpressError = require('../expressError');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

const registerUser = async (req, res, next) => {
  try {
    const { username, password, first_name, last_name, phone} = req.body;
    const newUser = await User.register({ username, password, first_name, last_name, phone})
    const token = jwt.sign({ username, type: 'admin' }, SECRET_KEY);
    return json({ message: 'User registered successfully', token, newUser})
  } catch(err) {
    if (err.code === '23505') {
      return next(new ExpressError('Username taken, please choose another', 400))
    }
    return next(err)
  }
}

const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.authenticate(username, password);

    if (user) {
      const token = jwt.sign({ username,  type: 'admin' }, SECRET_KEY)
      await User.updateLoginTimestamp(username);
      return res.json({ message: 'Logged In', token})
    } else {
      throw new ExpressError('Invalid username/password', 400)
    }
  } catch(err) {
    return next(err)
  }
}

module.exports= { registerUser, loginUser }