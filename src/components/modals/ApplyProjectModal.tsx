import React from 'react';

interface ApplyProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { deadline: string; expectedPayment: number }) => Promise<void> | void;
}

const ApplyProjectModal: React.FC<ApplyProjectModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [deadline, setDeadline] = React.useState('');
  const [expectedPayment, setExpectedPayment] = React.useState<string>('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amount = Number(expectedPayment);
    if (!deadline.trim() || !expectedPayment.trim() || isNaN(amount)) {
      setError('Please enter a valid deadline and expected payment.');
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit({ deadline: deadline.trim(), expectedPayment: amount });
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to apply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="font-medium">Apply to Project</div>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input
              type="text"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="e.g., 2025-10-15 or End of Oct"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Payment (USD)</label>
            <input
              type="number"
              value={expectedPayment}
              onChange={(e) => setExpectedPayment(e.target.value)}
              placeholder="e.g., 1200"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring"
              min={0}
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded border hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50">{submitting ? 'Submitting…' : 'Submit Application'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyProjectModal;


