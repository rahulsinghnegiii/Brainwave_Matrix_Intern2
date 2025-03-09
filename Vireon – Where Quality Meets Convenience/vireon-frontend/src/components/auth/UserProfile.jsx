import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

const schema = yup.object().shape({
  name: yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .matches(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces')
    .max(50, 'Name must be less than 50 characters'),
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  phone: yup.string()
    .matches(/^\+?[1-9]\d{9,11}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
});

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { user, updateProfile, isUpdatingProfile, updateProfileError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    }
  });

  const onSubmit = async (data) => {
    try {
      await updateProfile(data);
      setIsEditing(false);
      reset(data);
    } catch (error) {
      // Error handling is done by the useAuth hook
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
  };

  const InputField = ({ name, label, type, icon: Icon, placeholder, disabled }) => (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          {...register(name)}
          id={name}
          type={type}
          disabled={disabled}
          className={`appearance-none block w-full pl-10 pr-3 py-3 border ${
            errors[name] ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
          } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
            disabled ? 'bg-gray-50 text-gray-500' : 'bg-white'
          }`}
          placeholder={placeholder}
        />
        <AnimatePresence>
          {errors[name] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
            >
              <FiX className="h-5 w-5 text-red-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {errors[name] && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 text-sm text-red-600"
          >
            {errors[name].message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
          {!isEditing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiEdit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </motion.button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <InputField
            name="name"
            label="Full Name"
            type="text"
            icon={FiUser}
            placeholder="John Doe"
            disabled={!isEditing}
          />

          <InputField
            name="email"
            label="Email Address"
            type="email"
            icon={FiMail}
            placeholder="you@example.com"
            disabled={!isEditing}
          />

          <InputField
            name="phone"
            label="Phone Number"
            type="tel"
            icon={FiPhone}
            placeholder="+1234567890"
            disabled={!isEditing}
          />

          <AnimatePresence>
            {updateProfileError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex">
                  <FiX className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-500">{updateProfileError}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex space-x-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!isDirty || !isValid || isUpdatingProfile}
                className={`flex-1 flex justify-center items-center px-4 py-2 text-sm font-medium text-white rounded-lg ${
                  isDirty && isValid && !isUpdatingProfile
                    ? 'bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700'
                    : 'bg-gray-400 cursor-not-allowed'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200`}
              >
                {isUpdatingProfile ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center"
                  >
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">Saving...</span>
                  </motion.div>
                ) : (
                  <>
                    <FiSave className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleCancel}
                disabled={isUpdatingProfile}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </motion.button>
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default UserProfile; 