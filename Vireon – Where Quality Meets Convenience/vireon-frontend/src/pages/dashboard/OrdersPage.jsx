import { useState, useEffect } from 'react';
import { FiDownload, FiEye, FiTrash2, FiChevronUp, FiChevronDown, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import SearchAndFilter from '../../components/common/SearchAndFilter';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import orderService from '../../services/orderService';
import { toast } from 'react-hot-toast';
import { CSVLink } from 'react-csv';

const statusColors = {
  Delivered: 'bg-green-100 text-green-800',
  Processing: 'bg-blue-100 text-blue-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const statuses = ['All', 'Delivered', 'Processing', 'Pending', 'Cancelled'];

const OrdersPage = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [csvData, setCsvData] = useState([]);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrders();
        setOrders(response?.data || []);
        
        // Prepare CSV data for export
        const csvFormattedData = (response?.data || []).map(order => ({
          'Order ID': order.id,
          'Customer': order.customer?.name || 'Unknown',
          'Date': order.createdAt ? format(new Date(order.createdAt), 'PPP') : 'Unknown',
          'Items': order.items?.length || 0,
          'Total': `$${order.total?.toFixed(2) || '0.00'}`,
          'Status': order.status || 'Unknown'
        }));
        setCsvData(csvFormattedData);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Sorting logic
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted and filtered orders
  const getSortedAndFilteredOrders = () => {
    let filteredOrders = [...orders];
    
    // Apply search and status filters
    filteredOrders = filteredOrders.filter(order => {
      const matchesSearch = 
        (order.id?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    
    // Apply sorting
    if (sortConfig.key) {
      filteredOrders.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle date sorting
        if (sortConfig.key === 'createdAt' && a.createdAt && b.createdAt) {
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredOrders;
  };

  // Get paginated orders
  const getPaginatedOrders = () => {
    const sortedAndFilteredOrders = getSortedAndFilteredOrders();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedAndFilteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Handle order deletion
  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      await orderService.deleteOrder(selectedOrder.id);
      setOrders(orders.filter(order => order.id !== selectedOrder.id));
      toast.success('Order deleted successfully');
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting order:', err);
      toast.error(err.message || 'Failed to delete order');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (err) {
      return dateString || 'Unknown';
    }
  };

  // Render sort indicator
  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? 
      <FiChevronUp className="inline ml-1" /> : 
      <FiChevronDown className="inline ml-1" />;
  };

  // Calculate total pages
  const totalPages = Math.ceil(getSortedAndFilteredOrders().length / itemsPerPage);

  // Pagination controls
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <FiAlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-2 text-lg font-medium text-gray-900">Error loading orders</p>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const paginatedOrders = getPaginatedOrders();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <div className="mt-4 sm:mt-0">
          {csvData.length > 0 && (
            <CSVLink 
              data={csvData}
              filename={"vireon-orders.csv"}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiDownload className="-ml-1 mr-2 h-5 w-5" />
              Export Orders
            </CSVLink>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={statuses}
        searchPlaceholder="Search orders..."
      />

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          {paginatedOrders.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('id')}
                  >
                    Order ID {renderSortIndicator('id')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('customer')}
                  >
                    Customer {renderSortIndicator('customer')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('createdAt')}
                  >
                    Date {renderSortIndicator('createdAt')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('items')}
                  >
                    Items {renderSortIndicator('items')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('total')}
                  >
                    Total {renderSortIndicator('total')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('status')}
                  >
                    Status {renderSortIndicator('status')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer?.name || 'Unknown Customer'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.items?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.total?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {order.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        title="View Details"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailsModal(true);
                        }}
                      >
                        <FiEye className="h-5 w-5" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        title="Delete Order"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDeleteModal(true);
                        }}
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No orders found matching your filters</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                }}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                currentPage === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                currentPage === totalPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing                 <span className="font-medium">{Math.min(currentPage * itemsPerPage, getSortedAndFilteredOrders().length)}</span> of{' '}
                <span className="font-medium">{getSortedAndFilteredOrders().length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                    currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                  } ring-1 ring-inset ring-gray-300 focus:outline-offset-0`}
                >
                  <span className="sr-only">Previous</span>
                  &larr;
                </button>
                {[...Array(totalPages).keys()].map((number) => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === number + 1
                        ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                    currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                  } ring-1 ring-inset ring-gray-300 focus:outline-offset-0`}
                >
                  <span className="sr-only">Next</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <Modal
          title="Order Details"
          onClose={() => setShowDetailsModal(false)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Order ID</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedOrder.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedOrder.customer?.name || 'Unknown'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[selectedOrder.status] || 'bg-gray-100 text-gray-800'}`}>
                    {selectedOrder.status || 'Unknown'}
                  </span>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total</h3>
                <p className="mt-1 text-sm text-gray-900">${selectedOrder.total?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedOrder.paymentMethod || 'Unknown'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Shipping Address</h3>
              <p className="mt-1 text-sm text-gray-900">
                {selectedOrder.shippingAddress?.street || 'No address provided'}<br />
                {selectedOrder.shippingAddress?.city && `${selectedOrder.shippingAddress.city}, `}
                {selectedOrder.shippingAddress?.state && `${selectedOrder.shippingAddress.state} `}
                {selectedOrder.shippingAddress?.zip || ''}<br />
                {selectedOrder.shippingAddress?.country || ''}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Items</h3>
              <div className="mt-2 border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {selectedOrder.items?.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <li key={index} className="py-3 flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">${item.price?.toFixed(2) || '0.00'}</p>
                      </li>
                    ))
                  ) : (
                    <li className="py-3 text-sm text-gray-500">No items found</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => {
                  // TODO: Implement update order status functionality
                  setShowDetailsModal(false);
                }}
              >
                Update Status
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedOrder && (
        <Modal
          title="Confirm Deletion"
          onClose={() => setShowDeleteModal(false)}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete order <span className="font-medium">{selectedOrder.id}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={handleDeleteOrder}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrdersPage;