import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { fetchDashboardStats } from '../../store/adminSlice';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatsCard from '../../components/admin/StatsCard';
import RecentOrdersList from '../../components/admin/RecentOrdersList';
import LowStockProducts from '../../components/admin/LowStockProducts';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('week');
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector(state => state.admin.dashboard);
  
  useEffect(() => {
    dispatch(fetchDashboardStats(timeRange));
  }, [dispatch, timeRange]);
  
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
        <div className="flex">
          <div className="flex-shrink-0">
            <FiAlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard data</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time range filter */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 text-sm font-medium ${
              timeRange === 'week'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } rounded-l-lg border border-gray-200`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 text-sm font-medium ${
              timeRange === 'month'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border-t border-b border-r border-gray-200`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 text-sm font-medium ${
              timeRange === 'year'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } rounded-r-lg border border-gray-200`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Customers" 
          value={stats.customersCount} 
          icon={FiUsers} 
          change={stats.customerGrowth}
          changeType={stats.customerGrowth >= 0 ? 'increase' : 'decrease'}
        />
        <StatsCard 
          title="Total Orders" 
          value={stats.ordersCount} 
          icon={FiShoppingBag} 
          change={stats.orderGrowth}
          changeType={stats.orderGrowth >= 0 ? 'increase' : 'decrease'}
        />
        <StatsCard 
          title="Total Revenue" 
          value={`$${stats.revenue.toFixed(2)}`} 
          icon={FiDollarSign} 
          change={stats.revenueGrowth}
          changeType={stats.revenueGrowth >= 0 ? 'increase' : 'decrease'}
        />
        <StatsCard 
          title="Avg. Order Value" 
          value={`$${stats.averageOrderValue.toFixed(2)}`} 
          icon={FiTrendingUp} 
          change={stats.aovGrowth}
          changeType={stats.aovGrowth >= 0 ? 'increase' : 'decrease'}
        />
      </div>
      
      {/* Sales chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Trend</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stats.salesTrend}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#4f46e5" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent orders and low stock */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
            <RecentOrdersList orders={stats.recentOrders} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Low Stock Products</h2>
            <LowStockProducts products={stats.lowStockProducts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 