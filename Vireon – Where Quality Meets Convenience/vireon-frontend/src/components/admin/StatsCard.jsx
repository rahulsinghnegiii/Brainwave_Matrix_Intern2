import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

const StatsCard = ({ title, value, icon: Icon, change, changeType }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <div className="flex items-center">
            {changeType === 'increase' ? (
              <FiArrowUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <FiArrowDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span
              className={`font-medium ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {Math.abs(change)}%
            </span>
            <span className="ml-1 text-gray-500">from previous period</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard; 