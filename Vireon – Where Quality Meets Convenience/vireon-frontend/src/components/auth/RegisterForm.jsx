import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

// Enhanced password validation
const passwordRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true
};

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
  password: yup.string()
    .required('Password is required')
    .min(passwordRules.minLength, `Password must be at least ${passwordRules.minLength} characters`)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .max(128, 'Password must be less than 128 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  phone: yup.string()
    .matches(/^\+?[1-9]\d{9,11}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
});

// Form animations
const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { 
      duration: 0.2 
    }
  }
};

const inputVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3
    }
  }
};

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser, isRegistering, registerError } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange'
  });

  const password = watch('password', '');

  const calculatePasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= passwordRules.minLength) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[a-z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[!@#$%^&*]/.test(pass)) strength += 1;
    return (strength / 5) * 100;
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  useEffect(() => {
    if (registrationSuccess) {
      const timer = setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Registration successful! Please sign in with your new account.',
            type: 'success'
          }
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [registrationSuccess, navigate]);

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      setRegistrationSuccess(true);
      reset(); // Clear form after successful registration
    } catch (err) {
      // Error handling is now done by the useAuth hook
      const errorElement = document.getElementById('error-message');
      if (errorElement) {
        errorElement.style.animation = 'shake 0.5s';
      }
    }
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 20) return 'bg-red-500';
    if (strength <= 40) return 'bg-orange-500';
    if (strength <= 60) return 'bg-yellow-500';
    if (strength <= 80) return 'bg-lime-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength) => {
    if (strength <= 20) return 'Very Weak';
    if (strength <= 40) return 'Weak';
    if (strength <= 60) return 'Medium';
    if (strength <= 80) return 'Strong';
    return 'Very Strong';
  };

  const InputField = ({ name, label, type, icon: Icon, placeholder, showPassword, togglePassword }) => (
    <motion.div 
      variants={inputVariants}
      className="space-y-1"
    >
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
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          className={`appearance-none block w-full pl-10 pr-${
            type === 'password' ? '12' : '3'
          } py-3 border ${
            errors[name] ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
          } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
          placeholder={placeholder}
          autoComplete={type === 'password' ? 'new-password' : 'off'}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-indigo-500 transition-colors"
          >
            {showPassword ? (
              <FiEyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <FiEye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        )}
        <AnimatePresence>
          {errors[name] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
            >
              <FiAlertCircle className="h-5 w-5 text-red-500" />
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
    </motion.div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={formVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-xl backdrop-blur-lg backdrop-filter"
      >
        <div>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-center text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600"
          >
            Create your account
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-center text-sm text-gray-600"
          >
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              sign in to your existing account
            </Link>
          </motion.p>
        </div>

        {registrationSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg p-4 bg-green-50 border border-green-200"
          >
            <div className="flex items-center">
              <FiCheckCircle className="h-5 w-5 text-green-400" />
              <p className="ml-3 text-sm text-green-700">
                Registration successful! Redirecting to login...
              </p>
            </div>
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <motion.div className="space-y-5">
            <InputField
              name="name"
              label="Full Name"
              type="text"
              icon={FiUser}
              placeholder="John Doe"
            />

            <InputField
              name="email"
              label="Email Address"
              type="email"
              icon={FiMail}
              placeholder="you@example.com"
            />

            <InputField
              name="phone"
              label="Phone Number"
              type="tel"
              icon={FiPhone}
              placeholder="+1234567890"
            />

            <div className="space-y-5">
              <InputField
                name="password"
                label="Password"
                type="password"
                icon={FiLock}
                placeholder="••••••••"
                showPassword={showPassword}
                togglePassword={() => setShowPassword(!showPassword)}
              />

              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Password Strength:</span>
                    <span className={`text-sm font-medium ${
                      passwordStrength > 60 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength}%` }}
                      className={`h-full ${getPasswordStrengthColor(passwordStrength)} transition-all duration-300`}
                    />
                  </div>
                </motion.div>
              )}

              <InputField
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                icon={FiLock}
                placeholder="••••••••"
                showPassword={showConfirmPassword}
                togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>
          </motion.div>

          <AnimatePresence>
            {registerError && (
              <motion.div
                id="error-message"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex">
                  <FiAlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-500">{registerError}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            whileHover={{ scale: isDirty && isValid && !isRegistering ? 1.02 : 1 }}
            whileTap={{ scale: isDirty && isValid && !isRegistering ? 0.98 : 1 }}
          >
            <button
              type="submit"
              disabled={isRegistering || !isDirty || !isValid}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                isDirty && isValid && !isRegistering
                  ? 'bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700'
                  : 'bg-gray-400 cursor-not-allowed'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200`}
            >
              {isRegistering ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center"
                >
                  <LoadingSpinner size="sm" color="white" />
                  <span>Creating account...</span>
                </motion.div>
              ) : (
                'Create Account'
              )}
            </button>
          </motion.div>
        </form>

        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
        `}</style>
      </motion.div>
    </div>
  );
};

export default RegisterForm;