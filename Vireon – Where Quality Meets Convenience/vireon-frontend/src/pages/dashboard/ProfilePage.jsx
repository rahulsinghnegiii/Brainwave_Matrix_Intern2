import { motion } from 'framer-motion';
import UserProfile from '../../components/auth/UserProfile';
import { useAuth } from '../../hooks/useAuth';

const ProfilePage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1">{user?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;