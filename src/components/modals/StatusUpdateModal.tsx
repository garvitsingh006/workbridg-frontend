import React, { useState } from 'react';
import { X, CheckCircle, Clock, AlertCircle, XCircle, FileText, DollarSign } from 'lucide-react';
import { useProject, type Project } from '../../contexts/ProjectContext';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export default function StatusUpdateModal({ isOpen, onClose, project }: StatusUpdateModalProps) {
  const { updateStatus, updateProject } = useProject();
  const [selectedStatus, setSelectedStatus] = useState<Project['status'] | ''>('');
  const [totalAmount, setTotalAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    {
      value: 'unassigned' as const,
      label: 'Unassigned',
      description: 'Project is not yet assigned to a freelancer',
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      value: 'pending' as const,
      label: 'Pending',
      description: 'Waiting for approval or review',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      value: 'in-progress' as const,
      label: 'In Progress',
      description: 'Project is actively being worked on',
      icon: AlertCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      value: 'completed' as const,
      label: 'Completed',
      description: 'Project has been finished successfully',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      value: 'cancelled' as const,
      label: 'Cancelled',
      description: 'Project has been cancelled',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !selectedStatus) return;
    
    // If approving project (setting to in-progress), total amount is required
    if (selectedStatus === 'in-progress' && (!totalAmount || parseFloat(totalAmount) <= 0)) {
      alert('Please enter a valid total amount to approve the project.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedStatus === 'in-progress' && totalAmount) {
        // Include totalAmount when approving project to trigger payment creation
        await updateProject(project.id, { 
          status: selectedStatus, 
          totalAmount: parseFloat(totalAmount) 
        });
      } else {
        await updateStatus(project.id, selectedStatus);
      }
      onClose();
      // Reset form
      setSelectedStatus('');
      setTotalAmount('');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update project status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusSelect = (status: Project['status']) => {
    setSelectedStatus(status);
    // Reset total amount when changing status
    if (status !== 'in-progress') {
      setTotalAmount('');
    }
  };

  if (!isOpen || !project) return null;

  const currentStatusOption = statusOptions.find(option => option.value === project.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Update Project Status</h2>
              <p className="text-sm text-gray-600">{project.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Current Status</h3>
          {currentStatusOption && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-lg ${currentStatusOption.bgColor}`}>
                <currentStatusOption.icon className={`w-5 h-5 ${currentStatusOption.color}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">{currentStatusOption.label}</p>
                <p className="text-sm text-gray-600">{currentStatusOption.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Status Options */}
        <form onSubmit={handleSubmit} className="p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Select New Status</h3>
          <div className="space-y-3 mb-6">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleStatusSelect(option.value)}
                disabled={option.value === project.status}
                className={`w-full flex items-center space-x-3 p-4 border-2 rounded-lg transition-all ${
                  option.value === project.status
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                    : selectedStatus === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${option.bgColor}`}>
                  <option.icon className={`w-5 h-5 ${option.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                {selectedStatus === option.value && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Total Amount Input for Project Approval */}
          {selectedStatus === 'in-progress' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Project Approval - Set Total Amount</h4>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Setting the total amount will automatically create a payment record with 10% advance and 90% final payment stages.
              </p>
              <div className="space-y-2">
                <label htmlFor="totalAmount" className="block text-sm font-medium text-blue-900">
                  Total Project Amount (₹)
                </label>
                <input
                  type="number"
                  id="totalAmount"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="Enter total amount (e.g., 50000)"
                  min="1"
                  step="1"
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-blue-600">
                  Client pays: Project amount + 10% platform fee. Freelancer receives: Project amount - 3% service fee = ₹{totalAmount ? (parseFloat(totalAmount) * 0.97).toLocaleString() : '0'}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedStatus || selectedStatus === project.status || isSubmitting}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus && selectedStatus !== project.status && !isSubmitting
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                'Update Status'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}