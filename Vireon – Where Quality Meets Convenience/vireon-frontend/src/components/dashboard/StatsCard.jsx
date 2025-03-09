import { motion } from 'framer-motion';

export const StatsCard = ({ item }) => (
  <motion.div
    key={item.name}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
  >
    <dt>
      <div className="absolute bg-indigo-500 rounded-md p-3">
        <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
      </div>
      <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
    </dt>
    <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
      <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
      <p className={`ml-2 flex items-baseline text-sm font-semibold ${
        item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
      }`}>
        {item.change}
      </p>
    </dd>
  </motion.div>
);