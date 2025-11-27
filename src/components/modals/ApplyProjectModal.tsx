import React from 'react';
import { X, FileText, Clock } from 'lucide-react';

interface ApplyProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { proposalSummary: string; estimatedDelivery: string; addOns: string }) => Promise<void> | void;
}

const ApplyProjectModal: React.FC<ApplyProjectModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [proposalSummary, setProposalSummary] = React.useState('');
  const [estimatedDelivery, setEstimatedDelivery] = React.useState('');
  const [addOns, setAddOns] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setProposalSummary('');
      setEstimatedDelivery('');
      setAddOns('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!proposalSummary.trim() || !estimatedDelivery.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit({ 
        proposalSummary: proposalSummary.trim(),
        estimatedDelivery: estimatedDelivery.trim(),
        addOns: addOns.trim()
      });
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to apply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Apply to Project</h3>
            <p className="text-sm text-gray-500 mt-0.5">Submit your proposal details</p>
          </div>
          <button
            onClick={() => { setError(null); onClose(); }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline-block mr-1" />
              Proposal Summary *
            </label>
            <textarea
              value={proposalSummary}
              onChange={(e) => setProposalSummary(e.target.value)}
              placeholder="2-3 sentences on how you will solve this project"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline-block mr-1" />
              Estimated Delivery Time *
            </label>
            <input
              type="text"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              placeholder="e.g., 5 days, 1 week, 3-4 days"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add-Ons (Optional)
            </label>
            <textarea
              value={addOns}
              onChange={(e) => setAddOns(e.target.value)}
              placeholder="e.g., Can also provide documentation, Free bug fixes for 7 days after delivery, Can deploy it for you if needed"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm resize-none"
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 transition-all font-medium text-sm shadow-lg shadow-purple-500/30"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyProjectModal;
