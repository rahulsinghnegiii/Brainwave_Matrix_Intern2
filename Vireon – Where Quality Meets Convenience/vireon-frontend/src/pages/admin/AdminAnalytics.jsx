import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics } from '../../store/adminSlice';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  const dispatch = useDispatch();
  const { analytics = {}, loading, error } = useSelector(state => state.admin.analytics || { analytics: {}, loading: false, error: null });
  
  useEffect(() => {
    dispatch(fetchAnalytics(timeRange));
  }, [dispatch, timeRange]);
  
  // Sample data for demonstration - in a real app, this would come from the API
  const salesData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 2000 },
    { name: 'Apr', amount: 2780 },
    { name: 'May', amount: 1890 },
    { name: 'Jun', amount: 2390 },
    { name: 'Jul', amount: 3490 },
    { name: 'Aug', amount: 3490 },
    { name: 'Sep', amount: 4000 },
    { name: 'Oct', amount: 3000 },
    { name: 'Nov', amount: 2000 },
    { name: 'Dec', amount: 2780 },
  ];
  
  const categoryData = [
    { name: 'Electronics', value: 400 },
    { name: 'Clothing', value: 300 },
    { name: 'Home & Kitchen', value: 300 },
    { name: 'Books', value: 200 },
    { name: 'Sports', value: 100 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-800 text-sm font-medium">{error}</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <select
            id="time-range"
            name="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="year">Last 12 months</option>
          </select>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales Over Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Over Time</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analytics.salesOverTime || salesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Revenue']}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#4F46E5" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Sales by Category */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sales by Category</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.salesByCategory || categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(analytics.salesByCategory || categoryData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Orders by Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Orders by Status</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.ordersByStatus || [
                  { name: 'Pending', value: 10 },
                  { name: 'Processing', value: 15 },
                  { name: 'Shipped', value: 20 },
                  { name: 'Delivered', value: 40 },
                  { name: 'Canceled', value: 5 },
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Orders" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Customer Acquisition */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Acquisition</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analytics.customerAcquisition || [
                  { name: 'Jan', newCustomers: 40, returningCustomers: 24 },
                  { name: 'Feb', newCustomers: 30, returningCustomers: 13 },
                  { name: 'Mar', newCustomers: 20, returningCustomers: 98 },
                  { name: 'Apr', newCustomers: 27, returningCustomers: 39 },
                  { name: 'May', newCustomers: 18, returningCustomers: 48 },
                  { name: 'Jun', newCustomers: 23, returningCustomers: 38 },
                  { name: 'Jul', newCustomers: 34, returningCustomers: 43 },
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="newCustomers" 
                  stroke="#4F46E5" 
                  name="New Customers" 
                />
                <Line 
                  type="monotone" 
                  dataKey="returningCustomers" 
                  stroke="#10B981" 
                  name="Returning Customers" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics; 