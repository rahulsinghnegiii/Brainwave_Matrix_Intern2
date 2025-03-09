import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiShoppingCart,
  FiPackage,
  FiHeart,
  FiMessageSquare,
  FiHelpCircle,
  FiUser,
  FiSettings,
  FiLogOut,
} from 'react-icons/fi';

const DashboardLayout = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', icon: FiHome, path: '/dashboard' },
    { name: 'Orders', icon: FiShoppingCart, path: '/dashboard/orders' },
    { name: 'Products', icon: FiPackage, path: '/dashboard/products' },
    { name: 'Wishlist', icon: FiHeart, path: '/dashboard/wishlist' },
    { name: 'Messages', icon: FiMessageSquare, path: '/dashboard/messages' },
    { name: 'Help & Support', icon: FiHelpCircle, path: '/dashboard/help-support' },
  ];

  const userMenu = [
    { name: 'Profile', icon: FiUser, path: '/dashboard/profile' },
    { name: 'Settings', icon: FiSettings, path: '/dashboard/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img
                src="/logo.png"
                alt="Vireon"
                className="h-8 w-8"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
              <h1 className="text-xl font-bold text-indigo-600">Vireon</h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4">
            <div className="space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                    isActive(item.path)
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive(item.path) ? 'text-indigo-600' : 'text-gray-400'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Account
              </h3>
              <div className="mt-4 space-y-4">
                {userMenu.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                      isActive(item.path)
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive(item.path) ? 'text-indigo-600' : 'text-gray-400'
                      }`}
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-200">
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <img
                  src="https://placehold.co/40x40"
                  alt="User"
                  className="h-10 w-10 rounded-full border-2 border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    John Doe
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    john.doe@example.com
                  </p>
                </div>
                <button
                  onClick={() => {/* Add logout logic */}}
                  className="p-1.5 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-50"
                  title="Logout"
                >
                  <FiLogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pl-64">
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 