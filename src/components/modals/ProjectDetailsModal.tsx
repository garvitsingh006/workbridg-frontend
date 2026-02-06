import { X, Calendar, DollarSign, Clock, Edit3, Tag } from 'lucide-react';
import type { Project } from '../../contexts/ProjectContext';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onEdit: (project: Project) => void;
  onApply?: (project: Project) => void;
}

import { useUser } from '../../contexts/UserContext';

export default function ProjectDetailsModal({ isOpen, onClose, project, onEdit, onApply }: ProjectDetailsModalProps) {
  const { user } = useUser();

  if (!isOpen || !project) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'unassigned':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      case 'unassigned':
        return 'Unassigned';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-[650px] max-h-[90vh] flex flex-col shadow-3xl" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'}}>
        {/* Fixed Header */}
        <div className="p-6 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{project.title}</h2>
              <p className="text-gray-500">Project Details</p>
            </div>
            <div className="flex items-center space-x-3">
              {user?.userType === 'client' && project.status === 'unassigned' && (
                <button
                  onClick={() => onEdit(project)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#f72585] text-white rounded-xl hover:bg-[#f72585]/90 transition-colors font-medium cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 pb-6 overflow-y-auto flex-1" style={{scrollBehavior: 'smooth'}}>
          <div className="space-y-6">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Status</label>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                    {formatStatus(project.status)}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Category</label>
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-[#f72585]" />
                    <span className="text-gray-900 font-medium">{project.category}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Payment Method</label>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-[#f72585]" />
                    <span className="text-gray-900 font-medium">
                      {project.paymentMethod === 'milestone' ? 'Milestone based' :
                       project.paymentMethod === 'upfront' ? '50% upfront + 50% after completion' :
                       'Hourly/Weekly'}
                    </span>
                    {project.paymentMethod === 'milestone' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Created By</label>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#f72585] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {project.createdBy?.fullName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-gray-900 font-medium">{project.createdBy?.fullName || 'Unknown User'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Deadline</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 font-medium">{project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline"}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Created</label>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 font-medium">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ""}</span>
                  </div>
                </div>

                {project.budget && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Budget</label>
                    <div className="flex items-center space-x-1">
                      <span className="text-xl font-semibold text-gray-900">₹{project.budget.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {project.assignedTo && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Assigned To</label>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {project.assignedTo?.fullName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="text-gray-900 font-medium">{project.assignedTo?.fullName || 'Unknown User'}</span>
                    </div>
                  </div>
                )}

                {project.payment && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Payment</label>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">${project.payment.amount.toLocaleString()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {project.payment.status}
                      </span>
                    </div>
                  </div>
                )}
            </div>

            {/* Description */}
            <div className="border-t border-gray-100 pt-6">
              <label className="text-lg font-semibold text-gray-900 mb-3 block">Description</label>
              <p className="text-gray-700 leading-relaxed">{project.description}</p>
            </div>

            {/* Remarks */}
            {project.remarks.length > 0 && (
              <div className="border-t border-gray-100 pt-6">
                <label className="text-lg font-semibold text-gray-900 mb-4 block">Remarks ({project.remarks.length})</label>
                <div className="space-y-4">
                  {project.remarks.map((remark, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-[#f72585] rounded-full flex items-center justify-center shrink-0">
                          <span className="text-white text-sm font-medium">
                            {remark.by?.fullName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{remark.by?.fullName || 'Unknown User'}</span>
                            <span className="text-sm text-gray-500">
                              {remark.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{remark.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {user?.userType === 'freelancer' && (
            <div className="border-t border-gray-100 pt-6">
              <button
                onClick={() => {
                  if (onApply && project) {
                    onApply(project);
                  }
                }}
                className="px-6 py-3 bg-linear-to-r from-[#f72585] to-[#f72585] text-white rounded-xl hover:from-[#f72585] hover:to-[#f72585] transition-all font-semibold shadow-lg shadow-[#f72585]/30 cursor-pointer"
              >
                Start Discussion
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}