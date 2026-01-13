import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, Eye } from 'lucide-react';
import api from '../../../api';

interface Application {
  _id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  client?: {
    fullName: string;
    username: string;
  };
  appliedAt: string;
  status: 'pending' | 'selected' | 'approved';
  expectedPayment?: string;
  proposalSummary?: string;
}

interface FreelancerApplicationsProps {
  notificationState?: {
    applicationId?: string;
  };
}

const FreelancerApplications: React.FC<FreelancerApplicationsProps> = ({ notificationState }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  // Handle notification navigation
  useEffect(() => {
    if (notificationState?.applicationId) {
      setHighlightedId(notificationState.applicationId);
      setTimeout(() => setHighlightedId(null), 2000);
    }
  }, [notificationState]);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/users/freelancer/applications');
      setApplications(response.data.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'selected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            <Eye className="w-3 h-3" />
            Selected by Client
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            Approved by Admin
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-1">Track the status of your project applications</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-gray-500">You haven't applied to any projects yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div 
              key={application._id} 
              className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300 ${
                highlightedId === application._id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{application.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{application.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Client: {application.client?.fullName || 'Unknown'}</span>
                    <span>•</span>
                    <span>Budget: ₹{application.budget?.toLocaleString() || '0'}</span>
                    <span>•</span>
                    <span>Category: {application.category || 'Unknown'}</span>
                  </div>
                </div>
                <div className="ml-4">
                  {getStatusBadge(application.status)}
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Expected Payment:</span>
                    <p className="text-gray-600 mt-1">₹{application.expectedPayment || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Applied:</span>
                    <p className="text-gray-600 mt-1">{new Date(application.appliedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-medium text-gray-700">Proposal Summary:</span>
                  <p className="text-gray-600 mt-1 text-sm">{application.proposalSummary || 'No summary provided'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FreelancerApplications;