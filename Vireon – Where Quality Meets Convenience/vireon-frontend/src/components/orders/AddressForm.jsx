import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { FiMapPin, FiUser, FiPhone, FiMail, FiHome, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { useSelector } from 'react-redux';

const AddressForm = ({ type = 'shipping', defaultValues = {}, onSubmit }) => {
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    reset,
    watch
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      fullName: defaultValues.fullName || '',
      email: defaultValues.email || '',
      phone: defaultValues.phone || '',
      address1: defaultValues.address1 || '',
      address2: defaultValues.address2 || '',
      city: defaultValues.city || '',
      state: defaultValues.state || '',
      zipCode: defaultValues.zipCode || '',
      country: defaultValues.country || 'US',
    },
  });

  const user = useSelector(state => state.auth.user);
  const savedAddresses = useSelector(state => state.user.addresses);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(null);
  
  // Watch address fields for real-time validation
  const addressFields = watch();
  
  // Address validation states
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  
  // Use saved address if available
  useEffect(() => {
    if (selectedSavedAddress) {
      reset(savedAddresses.find(addr => addr.id === selectedSavedAddress));
    }
  }, [selectedSavedAddress, savedAddresses, reset]);
  
  // Prefill with user data when available
  useEffect(() => {
    if (user && Object.keys(defaultValues).length === 0) {
      reset({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        // other fields remain empty
      });
    }
  }, [user, defaultValues, reset]);
  
  // Validate address in real-time
  useEffect(() => {
    const validateAddress = async () => {
      if (
        addressFields.address1 &&
        addressFields.city &&
        addressFields.state &&
        addressFields.zipCode &&
        touchedFields.zipCode
      ) {
        setIsValidatingAddress(true);
        try {
          // Simulate API call to address validation service
          setTimeout(() => {
            // This would be an actual API call in production
            const suggestions = [
              {
                id: 'sugg1',
                address1: addressFields.address1,
                city: addressFields.city,
                state: addressFields.state,
                zipCode: addressFields.zipCode,
                isValid: true
              }
            ];
            setAddressSuggestions(suggestions);
            setIsValidatingAddress(false);
          }, 800);
        } catch (error) {
          console.error('Address validation failed:', error);
          setIsValidatingAddress(false);
        }
      }
    };
    
    validateAddress();
  }, [addressFields.address1, addressFields.city, addressFields.state, addressFields.zipCode, touchedFields.zipCode]);
  
  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      sameAsBilling
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Saved Addresses Dropdown */}
      {savedAddresses?.length > 0 && (
        <div className="mb-4">
          <label htmlFor="savedAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Use a saved address
          </label>
          <select
            id="savedAddress"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            onChange={(e) => setSelectedSavedAddress(e.target.value)}
            value={selectedSavedAddress || ''}
          >
            <option value="">-- Select a saved address --</option>
            {savedAddresses.map(address => (
              <option key={address.id} value={address.id}>
                {address.fullName} - {address.address1}, {address.city}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Personal Information */}
      <div>
        <h3 className="text-base font-medium text-gray-900">Personal Information</h3>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                id="fullName"
                {...register('fullName', { required: 'Full name is required' })}
                className={`block w-full pr-10 ${errors.fullName ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm rounded-md`}
              />
              {errors.fullName ? (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiAlertCircle className="h-5 w-5 text-red-500" />
                </div>
              ) : touchedFields.fullName && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiCheck className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            {errors.fullName && (
              <p className="mt-2 text-sm text-red-600" id="fullName-error">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9+\-\s()]*$/,
                    message: 'Invalid phone number',
                  },
                })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Address Line 1 */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                {...register('address1', { required: 'Street address is required' })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Street address, P.O. box, company name"
              />
            </div>
            {errors.address1 && (
              <p className="mt-1 text-sm text-red-600">{errors.address1.message}</p>
            )}
          </div>

          {/* Address Line 2 */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Apartment, suite, etc.
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiHome className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                {...register('address2')}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              {...register('city', { required: 'City is required' })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              State / Province
            </label>
            <input
              type="text"
              {...register('state', { required: 'State is required' })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
            )}
          </div>

          {/* ZIP Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ZIP / Postal Code
            </label>
            <input
              type="text"
              {...register('zipCode', { required: 'ZIP code is required' })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.zipCode && (
              <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <select
              {...register('country', { required: 'Country is required' })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="MX">Mexico</option>
              {/* Add more countries as needed */}
            </select>
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
            )}
          </div>

          {/* Address validation feedback */}
          {isValidatingAddress && (
            <div className="col-span-full">
              <div className="flex items-center">
                <div className="mr-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                </div>
                <span className="text-sm text-gray-500">Validating address...</span>
              </div>
            </div>
          )}
          
          {addressSuggestions.length > 0 && (
            <div className="col-span-full bg-green-50 p-3 rounded">
              <p className="text-sm text-green-700 flex items-center">
                <FiCheck className="mr-2 h-5 w-5" />
                Address validated successfully
              </p>
            </div>
          )}
          
          {/* Same as billing checkbox */}
          <div className="col-span-full">
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="sameAsBilling"
                  type="checkbox"
                  checked={sameAsBilling}
                  onChange={() => setSameAsBilling(!sameAsBilling)}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="sameAsBilling" className="font-medium text-gray-700">
                  Billing address is the same as shipping address
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={!isValid}
        >
          Save {type === 'shipping' ? 'Shipping' : 'Billing'} Address
        </button>
      </div>
    </form>
  );
};

export default AddressForm; 