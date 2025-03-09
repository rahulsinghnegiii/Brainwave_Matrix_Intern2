import { NavLink } from 'react-router-dom';
import { 
  FiX,
  FiHome,
  FiShoppingCart,
  FiPackage,
  FiHeart,
  FiClock,
  FiMessageSquare,
  FiHelpCircle
} from 'react-icons/fi';

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: FiHome },
  { name: 'Orders', to: '/dashboard/orders', icon: FiShoppingCart },
  { name: 'Products', to: '/dashboard/products', icon: FiPackage },
  { name: 'Wishlist', to: '/dashboard/wishlist', icon: FiHeart },
  { name: 'Order History', to: '/dashboard/history', icon: FiClock },
  { name: 'Messages', to: '/dashboard/messages', icon: FiMessageSquare },
  { name: 'Help & Support', to: '/dashboard/support', icon: FiHelpCircle },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={`lg:hidden fixed inset-0 flex z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300 ease-in-out`}
          onClick={onClose}
        />

        {/* Sidebar panel */}
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={onClose}
            >
              <span className="sr-only">Close sidebar</span>
              <FiX className="h-6 w-6 text-white" />
            </button>
          </div>

          <SidebarContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
            <SidebarContent />
          </div>
        </div>
      </div>
    </>
  );
};

const SidebarContent = () => {
  return (
    <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
      <div className="flex-shrink-0 flex items-center px-4">
        <img
          className="h-8 w-auto"
          src="/logo.png"
          alt="Vireon"
        />
      </div>
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon
              className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
              aria-hidden="true"
            />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 