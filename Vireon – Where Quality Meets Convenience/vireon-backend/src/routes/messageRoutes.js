const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { upload } = require('../utils/fileUpload');
const messageController = require('../controllers/messageController');

// Get all chats with messages
router.get('/', auth, messageController.getChats);

// Send a new message
router.post('/', auth, upload.single('file'), messageController.sendMessage);

// Mark messages as read
router.put('/:chatId/read', auth, messageController.markAsRead);

module.exports = router; 