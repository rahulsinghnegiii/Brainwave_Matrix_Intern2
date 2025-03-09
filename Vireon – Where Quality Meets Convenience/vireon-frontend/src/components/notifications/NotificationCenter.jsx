import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX, FiPackage, FiCreditCard, FiMessageCircle } from 'react-icons/fi';
import { markNotificationsAsRead, removeNotification } from '../../store/notificationSlice';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useSelector(state => state.notifications.items);
  const unreadCount = notifications.filter(n => !n.read).length;
  const dispatch = useDispatch();
  
  // Close notification center when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.notification-center')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Mark all as read when opening
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      dispatch(markNotificationsAsRead());
    }
  }, [isOpen, unreadCount, dispatch]);
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_update':
        return <FiPackage className="h-5 w-5 text-indigo-600" />;
      case 'payment_update':
        return <FiCreditCard className="h-5 w-5 text-green-600" />;
      case 'message':
        return <FiMessageCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <FiBell className="h-5 w-5 text-gray-600" />;
    }
  };
  
  const handleDeleteNotification = (id, e) => {
    e.stopPropagation();
    dispatch(removeNotification(id));
  };
  
  return (
    <div className="relative notification-center">
      <button
        className="relative p-1 rounded-full text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FiBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          >
            <div className="py-2 divide-y divide-gray-100">
              <div className="px-4 py-2 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                    onClick={() => dispatch(markNotificationsAsRead())}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    No notifications yet
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {notifications.map(notification => (
                        <motion.li
                          key={notification.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`px-4 py-3 text-sm hover:bg-gray-50 ${!notification.read ? 'bg-indigo-50' : ''}`}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="ml-3 w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.message}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <button
                                onClick={(e) => handleDeleteNotification(notification.id, e)}
                                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <FiX className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter; 