import { FiCheckCircle, FiAlertTriangle, FiClock, FiXCircle } from 'react-icons/fi';

const PaymentStatus = ({ status }) => {
  let StatusIcon;
  let statusText;
  let bgColor;
  let textColor;
  let borderColor;

  switch (status) {
    case 'succeeded':
      StatusIcon = FiCheckCircle;
      statusText = 'Payment Successful';
      bgColor = 'bg-green-50';
      textColor = 'text-green-800';
      borderColor = 'border-green-200';
      break;
    case 'processing':
      StatusIcon = FiClock;
      statusText = 'Processing Payment';
      bgColor = 'bg-yellow-50';
      textColor = 'text-yellow-800';
      borderColor = 'border-yellow-200';
      break;
    case 'requires_payment_method':
      StatusIcon = FiAlertTriangle;
      statusText = 'Payment Failed';
      bgColor = 'bg-red-50';
      textColor = 'text-red-800';
      borderColor = 'border-red-200';
      break;
    case 'requires_confirmation':
      StatusIcon = FiClock;
      statusText = 'Awaiting Confirmation';
      bgColor = 'bg-blue-50';
      textColor = 'text-blue-800';
      borderColor = 'border-blue-200';
      break;
    case 'canceled':
      StatusIcon = FiXCircle;
      statusText = 'Payment Canceled';
      bgColor = 'bg-gray-50';
      textColor = 'text-gray-800';
      borderColor = 'border-gray-200';
      break;
    default:
      StatusIcon = FiAlertTriangle;
      statusText = 'Unknown Status';
      bgColor = 'bg-gray-50';
      textColor = 'text-gray-800';
      borderColor = 'border-gray-200';
  }

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor} border ${borderColor}`}>
      <StatusIcon className="mr-1.5 h-4 w-4" />
      {statusText}
    </div>
  );
};

export default PaymentStatus; 