const Message = require('../models/message');
const ExpressError = require('../expressError');

const getMessagesById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await Message.get(id);
    res.json({ message });
  } catch(err) {
    return next(err);
  }
}

const postMessage = async (req, res, next) => {
  try {
    const { to_username, body } = req.body;
    const newMessage = await Message.create({ from_username, to_username, body });
    res.json({ message: newMessage });
  } catch(err) {
    return next(err);
  }
}

const markMessageAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedMessage = await Message.markRead(id);
    res,json({ message: updatedMessage });
  } catch(err) {
    return next(err);
  }
}

module.exports = { getMessagesById, postMessage, markMessageAsRead }