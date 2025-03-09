import { useState } from 'react';
import {
  FiHelpCircle,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: 'How do I track my order?',
    answer:
      'You can track your order by going to the Orders page and clicking on the specific order. You will see real-time updates on your order status and shipping information.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay. All payments are processed securely through our payment gateway.',
  },
  {
    question: 'What is your return policy?',
    answer:
      'We offer a 30-day return policy for most items. Products must be unused and in their original packaging. Please visit our Returns page for more detailed information.',
  },
  {
    question: 'How can I change my shipping address?',
    answer:
      'You can update your shipping address in your account settings. For orders that have already been placed, please contact our support team immediately to request an address change.',
  },
  {
    question: 'Do you ship internationally?',
    answer:
      'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. You can see the exact shipping cost during checkout.',
  },
];

const HelpSupportPage = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    description: '',
    priority: 'medium',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual ticket submission API call here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setTicketForm({
        subject: '',
        category: '',
        description: '',
        priority: 'medium',
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to submit ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* FAQs */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="flex justify-between items-center w-full text-left"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {faq.question}
                    </span>
                    {expandedFaq === index ? (
                      <FiChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <FiChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 overflow-hidden"
                      >
                        <p className="text-sm text-gray-500">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Support Ticket Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Submit a Support Ticket
            </h2>
            
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700"
                >
                  <FiCheckCircle className="h-5 w-5 mr-2" />
                  <span>Your ticket has been submitted successfully! We'll get back to you soon.</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <form onSubmit={handleSubmitTicket} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) =>
                    setTicketForm({ ...ticketForm, subject: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={ticketForm.category}
                  onChange={(e) =>
                    setTicketForm({ ...ticketForm, category: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select a category</option>
                  <option value="orders">Orders</option>
                  <option value="shipping">Shipping</option>
                  <option value="returns">Returns</option>
                  <option value="technical">Technical Support</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) =>
                    setTicketForm({ ...ticketForm, description: e.target.value })
                  }
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  value={ticketForm.priority}
                  onChange={(e) =>
                    setTicketForm({ ...ticketForm, priority: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={isSubmitting}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage; 