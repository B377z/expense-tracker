// routes/notifications.js
const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id });
    res.json(notifications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get unread notifications
router.get('/unread', auth, async (req, res) => {
  try {
    const unreadNotifications = await Notification.find({ user: req.user.id, read: false });
    res.json(unreadNotifications);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mark all notifications as read
router.put('/read', auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
