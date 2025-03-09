import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiCreditCard, FiLock } from 'react-icons/fi';
import { SiPaypal, SiApple, SiGooglepay } from 'react-icons/si';

const PaymentForm = ({ onSubmit }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handlePaymentSubmit = (data) => {
    onSubmit({ ...data, paymentMethod });
  };

  return (
    <form onSubmit={handleSubmit(handlePaymentSubmit)} className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <label className="text-base font-medium text-gray-900">Payment Method</label>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <div
            className={`relative border rounded-lg p-4 flex cursor-pointer focus:outline-none ${
              paymentMethod === 'credit-card' 
                ? 'border-indigo-500 ring-2 ring-indigo-500' 
                : 'border-gray-300'
            }`}
            onClick={() => setPaymentMethod('credit-card')}
          >
            <div className="flex-1 flex">
              <div className="flex flex-col">
                <span className="block text-sm font-medium text-gray-900">Credit / Debit Card</span>
                <span className="mt-1 flex items-center text-sm text-gray-500">All major cards accepted</span>
              </div>
            </div>
            <FiCreditCard className="h-5 w-5 text-indigo-600" aria-hidden="true" />
          </div>

          <div
            className={`relative border rounded-lg p-4 flex cursor-pointer focus:outline-none ${
              paymentMethod === 'paypal' 
                ? 'border-indigo-500 ring-2 ring-indigo-500' 
                : 'border-gray-300'
            }`}
            onClick={() => setPaymentMethod('paypal')}
          >
            <div className="flex-1 flex">
              <div className="flex flex-col">
                <span className="block text-sm font-medium text-gray-900">PayPal</span>
                <span className="mt-1 flex items-center text-sm text-gray-500">Pay with your PayPal account</span>
              </div>
            </div>
            <SiPaypal className="h-5 w-5 text-indigo-600" aria-hidden="true" />
          </div>

          <div
            className={`relative border rounded-lg p-4 flex cursor-pointer focus:outline-none ${
              paymentMethod === 'apple-pay' 
                ? 'border-indigo-500 ring-2 ring-indigo-500' 
                : 'border-gray-300'
            }`}
            onClick={() => setPaymentMethod('apple-pay')}
          >
            <div className="flex-1 flex">
              <div className="flex flex-col">
                <span className="block text-sm font-medium text-gray-900">Apple Pay</span>
                <span className="mt-1 flex items-center text-sm text-gray-500">Fast checkout with Apple Pay</span>
              </div>
            </div>
            <SiApple className="h-5 w-5 text-indigo-600" aria-hidden="true" />
          </div>

          <div
            className={`relative border rounded-lg p-4 flex cursor-pointer focus:outline-none ${
              paymentMethod === 'google-pay' 
                ? 'border-indigo-500 ring-2 ring-indigo-500' 
                : 'border-gray-300'
            }`}
            onClick={() => setPaymentMethod('google-pay')}
          >
            <div className="flex-1 flex">
              <div className="flex flex-col">
                <span className="block text-sm font-medium text-gray-900">Google Pay</span>
                <span className="mt-1 flex items-center text-sm text-gray-500">Fast checkout with Google Pay</span>
              </div>
            </div>
            <SiGooglepay className="h-5 w-5 text-indigo-600" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Credit Card Details - Show only when credit card is selected */}
      {paymentMethod === 'credit-card' && (
        <>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            {/* Card Number */}
            <div className="sm:col-span-2">
              <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
                Card Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  {...register('cardNumber', {
                    required: 'Card number is required',
                    pattern: {
                      value: /^[0-9]{16}$/,
                      message: 'Please enter a valid 16-digit card number',
                    },
                  })}
                  id="card-number"
                  placeholder="0000 0000 0000 0000"
                  className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <FiLock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
              </div>
              {errors.cardNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
              )}
            </div>

            {/* Card Holder */}
            <div className="sm:col-span-2">
              <label htmlFor="name-on-card" className="block text-sm font-medium text-gray-700">
                Name on Card
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register('nameOnCard', { required: 'Name on card is required' })}
                  id="name-on-card"
                  placeholder="Full name on card"
                  className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {errors.nameOnCard && (
                <p className="mt-1 text-sm text-red-600">{errors.nameOnCard.message}</p>
              )}
            </div>

            {/* Expiration */}
            <div>
              <label htmlFor="expiration-date" className="block text-sm font-medium text-gray-700">
                Expiration Date (MM/YY)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register('expirationDate', {
                    required: 'Expiration date is required',
                    pattern: {
                      value: /^(0[1-9]|1[0-2])\/?([0-9]{2})$/,
                      message: 'Please enter a valid expiration date (MM/YY)',
                    },
                  })}
                  id="expiration-date"
                  placeholder="MM/YY"
                  className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {errors.expirationDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expirationDate.message}</p>
              )}
            </div>

            {/* CVC */}
            <div>
              <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
                CVC
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register('cvc', {
                    required: 'CVC is required',
                    pattern: {
                      value: /^[0-9]{3,4}$/,
                      message: 'Please enter a valid CVC (3-4 digits)',
                    },
                  })}
                  id="cvc"
                  placeholder="123"
                  className="block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {errors.cvc && (
                <p className="mt-1 text-sm text-red-600">{errors.cvc.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center mt-4">
            <input
              id="save-card"
              name="save-card"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="save-card" className="ml-2 block text-sm text-gray-900">
              Save this card for future purchases
            </label>
          </div>
        </>
      )}

      {/* PayPal, Apple Pay, or Google Pay would redirect to their respective payment flows */}
      {paymentMethod !== 'credit-card' && (
        <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
          <p className="text-sm text-gray-600">
            {paymentMethod === 'paypal' && "You'll be redirected to PayPal to complete your purchase securely."}
            {paymentMethod === 'apple-pay' && "You'll complete your purchase using Apple Pay."}
            {paymentMethod === 'google-pay' && "You'll complete your purchase using Google Pay."}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default PaymentForm; 