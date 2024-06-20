// utils/sendNotification.js
const Notification = require('../models/Notification');

const sendNotification = async (userId, message) => {
  const notification = new Notification({
    user: userId,
    message,
  });
  await notification.save();
};

module.exports = sendNotification;
