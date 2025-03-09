import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSend, FiPaperclip, FiMoreVertical, FiSearch, FiCheck, FiClock, FiImage } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Mock data for initial development
const MOCK_CHATS = [
  {
    id: 1,
    name: 'Support Team',
    lastMessage: 'Thank you for your inquiry. We will look into it.',
    timestamp: new Date(),
    unread: 2,
    avatar: 'https://ui-avatars.com/api/?name=Support+Team&background=random',
    messages: [
      {
        id: 1,
        senderId: 'user',
        text: 'Hi, I have a question about my recent order',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        status: 'delivered'
      },
      {
        id: 2,
        senderId: 'support',
        text: "Hello! I would be happy to help you with your order. Could you please provide your order number?",
        timestamp: new Date(Date.now() - 1000 * 60 * 4),
        status: 'delivered'
      }
    ]
  },
  {
    id: 2,
    name: 'Technical Support',
    lastMessage: 'Have you tried clearing your browser cache?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    unread: 1,
    avatar: 'https://ui-avatars.com/api/?name=Tech+Support&background=random',
    messages: [
      {
        id: 1,
        senderId: 'user',
        text: 'The website is not loading properly',
        timestamp: new Date(Date.now() - 1000 * 60 * 35),
        status: 'delivered'
      },
      {
        id: 2,
        senderId: 'support',
        text: 'Have you tried clearing your browser cache?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'delivered'
      }
    ]
  }
];

const MessagesPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // Local state
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [chats, setChats] = useState(MOCK_CHATS);
  
  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Fetch chats on component mount
  useEffect(() => {
    fetchChats();
  }, [user]);

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to fetch from API first
      try {
        const response = await axios.get(`${API_URL}/messages`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setChats(response.data);
      } catch (apiError) {
        console.log('Using mock data as API is not available:', apiError);
        // If API fails, use mock data
        setChats(MOCK_CHATS);
      }
    } catch (err) {
      setError('Failed to fetch messages');
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const formatMessageTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5;

    if (diffInHours < 24) {
      return format(date, 'h:mm a');
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const formatChatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5;

    if (diffInHours < 1) {
      const minutes = Math.floor((now - date) / 60000);
      return `${minutes} min ago`;
    } else if (diffInHours < 24) {
      return format(date, 'h:mm a');
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.url;
    } catch (err) {
      throw new Error('Failed to upload file');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !file) || !selectedChat) return;

    const newMessage = {
      id: Date.now(),
      senderId: user?.id || 'user', // Fallback to 'user' if no user id
      text: message.trim(),
      timestamp: new Date(),
      status: 'sending'
    };

    if (file) {
      try {
        // Simulate file upload in development
        await new Promise(resolve => setTimeout(resolve, 1000));
        newMessage.fileUrl = URL.createObjectURL(file);
        newMessage.fileName = file.name;
        setFile(null);
      } catch (err) {
        toast.error('Failed to upload file');
        return;
      }
    }

    try {
      // Optimistic update
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChat.id 
            ? {
                ...chat,
                messages: [...chat.messages, newMessage],
                lastMessage: message.trim() || 'Sent an attachment',
                timestamp: new Date(),
                unread: 0
              }
            : chat
        )
      );

      setMessage('');

      // Try to send to API
      try {
        const response = await axios.post(`${API_URL}/messages`, {
          chatId: selectedChat.id,
          message: newMessage
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Update with server response if successful
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === selectedChat.id 
              ? {
                  ...chat,
                  messages: chat.messages.map(msg => 
                    msg.id === newMessage.id 
                      ? { ...msg, ...response.data, status: 'delivered' }
                      : msg
                  )
                }
              : chat
          )
        );
      } catch (apiError) {
        console.log('API not available, continuing with mock data:', apiError);
        // If API fails, just update the message status
        setTimeout(() => {
          setChats(prevChats => 
            prevChats.map(chat => 
              chat.id === selectedChat.id 
                ? {
                    ...chat,
                    messages: chat.messages.map(msg => 
                      msg.id === newMessage.id 
                        ? { ...msg, status: 'delivered' }
                        : msg
                    )
                  }
                : chat
            )
          );
        }, 1000);
      }

      simulateTyping();
    } catch (err) {
      toast.error('Failed to send message');
      // Revert optimistic update
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChat.id 
            ? {
                ...chat,
                messages: chat.messages.filter(msg => msg.id !== newMessage.id)
              }
            : chat
        )
      );
    }
  };

  const simulateTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      simulateResponse();
    }, 2000);
  };

  const simulateResponse = async () => {
    if (!selectedChat) return;

    const responses = [
      "I understand. Let me check that for you.",
      "Thank you for providing that information.",
      "Is there anything else you'd like to know?",
      "I'll look into this right away.",
      "Please allow me a moment to check our system."
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const newMessage = {
      id: Date.now(),
      senderId: 'support',
      text: randomResponse,
      timestamp: new Date(),
      status: 'delivered'
    };

    try {
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChat.id 
            ? {
                ...chat,
                messages: [...chat.messages, newMessage],
                lastMessage: randomResponse,
                timestamp: new Date()
              }
            : chat
        )
      );
    } catch (err) {
      toast.error('Failed to receive response');
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchChats}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-2rem)]">
        <div className="grid grid-cols-12 h-full">
          {/* Chat List */}
          <div className="col-span-4 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence>
                {filteredChats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                      selectedChat?.id === chat.id ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {chat.name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatChatTimestamp(chat.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                      </div>
                      {chat.unread > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-indigo-600 rounded-full">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Chat Window */}
          <div className="col-span-8 flex flex-col h-full">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedChat.avatar}
                      alt={selectedChat.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {selectedChat.name}
                      </h3>
                      <p className="text-xs text-green-500">Online</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
                    <FiMoreVertical className="h-5 w-5" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <AnimatePresence>
                    {selectedChat.messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex ${
                          msg.senderId === (user?.id || 'user') ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.senderId === (user?.id || 'user')
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {msg.fileUrl && (
                            <div className="mb-2">
                              {msg.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                <img
                                  src={msg.fileUrl}
                                  alt="attachment"
                                  className="rounded-lg max-w-full h-auto"
                                />
                              ) : (
                                <a
                                  href={msg.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-2 text-sm underline"
                                >
                                  <FiPaperclip className="h-4 w-4" />
                                  <span>{msg.fileName}</span>
                                </a>
                              )}
                            </div>
                          )}
                          <p className="text-sm">{msg.text}</p>
                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <span
                              className={`text-xs ${
                                msg.senderId === (user?.id || 'user')
                                  ? 'text-indigo-200'
                                  : 'text-gray-500'
                              }`}
                            >
                              {formatMessageTimestamp(msg.timestamp)}
                            </span>
                            {msg.senderId === (user?.id || 'user') && (
                              <span className="text-indigo-200">
                                {msg.status === 'sending' ? (
                                  <FiClock className="h-3 w-3" />
                                ) : (
                                  <FiCheck className="h-3 w-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 relative"
                    >
                      <FiPaperclip className="h-5 w-5" />
                      {file && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">1</span>
                        </div>
                      )}
                    </button>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={file ? `File selected: ${file.name}` : "Type a message..."}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!message.trim() && !file}
                      className="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiSend className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a chat from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MessagesPage;