import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiStar, FiSend } from 'react-icons/fi';

const ReviewForm = ({ productId, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      comment: '',
    },
  });

  const handleFormSubmit = async (data) => {
    if (rating === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        rating,
        productId,
        date: new Date().toISOString(),
      });
      
      // Reset form after successful submission
      reset();
      setRating(0);
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Write a Review
      </h3>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full"
              >
                <FiStar
                  className={`h-6 w-6 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating === 0 && (
            <p className="mt-1 text-sm text-red-600">
              Please select a rating
            </p>
          )}
        </div>

        {/* Review Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Review Title
          </label>
          <input
            type="text"
            {...register('title', {
              required: 'Please provide a title for your review',
              minLength: {
                value: 3,
                message: 'Title must be at least 3 characters long',
              },
            })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Review Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Your Review
          </label>
          <textarea
            {...register('comment', {
              required: 'Please write your review',
              minLength: {
                value: 10,
                message: 'Review must be at least 10 characters long',
              },
            })}
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.comment && (
            <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <FiSend className="-ml-1 mr-2 h-5 w-5" />
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 