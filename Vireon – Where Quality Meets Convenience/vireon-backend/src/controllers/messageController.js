const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { uploadFile } = require('../utils/fileUpload');

// Get all chats for a user
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    }).sort({ timestamp: -1 });

    // Get latest messages for each chat
    const chatsWithMessages = await Promise.all(chats.map(async (chat) => {
      const messages = await Message.find({ chatId: chat._id })
        .sort({ timestamp: -1 })
        .limit(50);
      return {
        ...chat.toObject(),
        messages: messages.reverse()
      };
    }));

    res.json(chatsWithMessages);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Error fetching chats' });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    let fileUrl, fileName;

    // Handle file upload if present
    if (req.file) {
      const uploadResult = await uploadFile(req.file);
      fileUrl = uploadResult.url;
      fileName = req.file.originalname;
    }

    const message = new Message({
      chatId,
      senderId: req.user._id,
      text,
      fileUrl,
      fileName,
      status: 'delivered'
    });

    await message.save();

    // Update chat's last message and timestamp
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: text || 'Sent an attachment',
      timestamp: new Date(),
      $inc: { unread: 1 }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    await Message.updateMany(
      { chatId, senderId: { $ne: req.user._id } },
      { status: 'read' }
    );

    await Chat.findByIdAndUpdate(chatId, { unread: 0 });

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
}; 