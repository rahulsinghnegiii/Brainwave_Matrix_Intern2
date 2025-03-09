import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSave, FiAlertCircle } from 'react-icons/fi';
import { updateSettings, testEmailConfig } from '../../store/adminSlice';

const AdminSettings = () => {
  const dispatch = useDispatch();
  const { settings, loading, error, success } = useSelector(state => state.admin.settings || { settings: {}, loading: false, error: null, success: false });
  
  const [formData, setFormData] = useState({
    storeName: settings.storeName || 'Vireon Shop',
    storeEmail: settings.storeEmail || 'info@vireonshop.com',
    storePhone: settings.storePhone || '',
    storeAddress: settings.storeAddress || '',
    taxRate: settings.taxRate || 0,
    shippingFee: settings.shippingFee || 0,
    currency: settings.currency || 'USD',
    emailNotifications: settings.emailNotifications || false,
    smtpHost: settings.smtpHost || '',
    smtpPort: settings.smtpPort || '',
    smtpUsername: settings.smtpUsername || '',
    smtpPassword: settings.smtpPassword || '',
    smtpEncryption: settings.smtpEncryption || 'tls',
  });
  
  const [testEmailStatus, setTestEmailStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (
        type === 'number' ? parseFloat(value) || 0 : value
      )
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateSettings(formData)).unwrap();
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };
  
  const handleTestEmail = async () => {
    setTestEmailStatus({ loading: true, success: false, error: null });
    try {
      await dispatch(testEmailConfig({
        host: formData.smtpHost,
        port: formData.smtpPort,
        username: formData.smtpUsername,
        password: formData.smtpPassword,
        encryption: formData.smtpEncryption
      })).unwrap();
      setTestEmailStatus({ loading: false, success: true, error: null });
    } catch (error) {
      setTestEmailStatus({ loading: false, success: false, error: error.message });
    }
  };
  
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Store Settings</h1>
      
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                There was an error saving your settings
              </h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-md">
          <p className="text-sm font-medium text-green-800">
            Settings saved successfully!
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        {/* Store Information */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Store Information</h3>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
                  Store Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="storeName"
                    id="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="storeEmail" className="block text-sm font-medium text-gray-700">
                  Store Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="storeEmail"
                    id="storeEmail"
                    value={formData.storeEmail}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="storePhone" className="block text-sm font-medium text-gray-700">
                  Store Phone
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="storePhone"
                    id="storePhone"
                    value={formData.storePhone}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <div className="mt-1">
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="storeAddress" className="block text-sm font-medium text-gray-700">
                  Store Address
                </label>
                <div className="mt-1">
                  <textarea
                    id="storeAddress"
                    name="storeAddress"
                    rows={3}
                    value={formData.storeAddress}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pricing & Shipping */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Pricing & Shipping</h3>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
                  Tax Rate (%)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="taxRate"
                    id="taxRate"
                    min="0"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="shippingFee" className="block text-sm font-medium text-gray-700">
                  Default Shipping Fee
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="shippingFee"
                    id="shippingFee"
                    min="0"
                    step="0.01"
                    value={formData.shippingFee}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Email Settings */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Email Settings</h3>
              <div className="flex items-center">
                <input
                  id="emailNotifications"
                  name="emailNotifications"
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                  Enable email notifications
                </label>
              </div>
            </div>
            
            {formData.emailNotifications && (
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700">
                    SMTP Host
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="smtpHost"
                      id="smtpHost"
                      value={formData.smtpHost}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700">
                    SMTP Port
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="smtpPort"
                      id="smtpPort"
                      value={formData.smtpPort}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700">
                    SMTP Username
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="smtpUsername"
                      id="smtpUsername"
                      value={formData.smtpUsername}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700">
                    SMTP Password
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="smtpPassword"
                      id="smtpPassword"
                      value={formData.smtpPassword}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label htmlFor="smtpEncryption" className="block text-sm font-medium text-gray-700">
                    Encryption
                  </label>
                  <div className="mt-1">
                    <select
                      id="smtpEncryption"
                      name="smtpEncryption"
                      value={formData.smtpEncryption}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <div className="flex items-center mt-7">
                    <button
                      type="button"
                      onClick={handleTestEmail}
                      disabled={testEmailStatus.loading}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {testEmailStatus.loading ? 'Testing...' : 'Test Email Configuration'}
                    </button>
                    
                    {testEmailStatus.success && (
                      <span className="ml-3 text-sm text-green-600">
                        Email configuration is working!
                      </span>
                    )}
                    
                    {testEmailStatus.error && (
                      <span className="ml-3 text-sm text-red-600">
                        {testEmailStatus.error}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="mr-1.5 -ml-1 h-4 w-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings; 