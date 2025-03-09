import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSearch, FiMail, FiPhone, FiMapPin, FiUserX } from 'react-icons/fi';
import { fetchCustomers } from '../../store/customerSlice';

const CustomersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const dispatch = useDispatch();
  const { items: customers, loading, error } = useSelector(state => state.customers || { items: [], loading: false, error: null });
  
  useEffect(() => {
    dispatch(fetchCustomers({ page: currentPage, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    dispatch(fetchCustomers({ page: 1, search: searchTerm }));
  };
  
  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
        <form onSubmit={handleSearch} className="mt-3 sm:mt-0 sm:ml-4">
          <div className="flex">
            <label htmlFor="search-customers" className="sr-only">
              Search Customers
            </label>
            <input
              type="text"
              name="search"
              id="search-customers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search by name or email"
            />
            <button
              type="submit"
              className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiSearch className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FiUserX className="h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {customers.map((customer) => (
              <div key={customer.id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="p-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      {customer.avatar ? (
                        <img 
                          src={customer.avatar} 
                          alt={customer.name} 
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium text-lg">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-medium text-gray-900">{customer.name}</h2>
                      <p className="text-gray-500 text-sm">Customer since {new Date(customer.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm">
                      <FiMail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <p className="text-gray-500">{customer.email}</p>
                    </div>
                    
                    {customer.phone && (
                      <div className="flex items-center text-sm">
                        <FiPhone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p className="text-gray-500">{customer.phone}</p>
                      </div>
                    )}
                    
                    {customer.address && (
                      <div className="flex items-center text-sm">
                        <FiMapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p className="text-gray-500">{customer.address}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-500">Total Orders:</span>
                        <span className="ml-1 font-medium text-gray-900">{customer.totalOrders || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Spent:</span>
                        <span className="ml-1 font-medium text-gray-900">${customer.totalSpent?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersManagement; 