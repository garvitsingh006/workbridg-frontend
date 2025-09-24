import { Menu, Bell, Search, User } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useEffect } from 'react';

interface DashboardHeaderProps {
  onMobileMenuToggle: () => void;
  activeFeature: string;
}

export default function DashboardHeader({ onMobileMenuToggle, activeFeature }: DashboardHeaderProps) {
  const { user, fetchUser } = useUser();
    useEffect(() => {
        fetchUser()
    }, [])
    
  const getFeatureTitle = () => {
    const titles: { [key: string]: string } = {
      home: 'Dashboard',
      projects: 'My Projects',
      messages: 'Messages',
      earnings: 'Earnings',
      analytics: 'Analytics',
      calendar: 'Calendar',
      notifications: 'Notifications',
      profile: 'Profile',
      settings: 'Settings',
    };
    return titles[activeFeature] || 'Dashboard';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            {getFeatureTitle()}
          </h1>
        </div>

        {/* Right side - Search, notifications, profile */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all w-64"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="hidden md:block font-medium">{user?.fullName || 'User'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}