import { useEffect, useMemo, useState } from 'react';
import { useProject } from '../../../contexts/ProjectContext';
import { usePayment } from '../../../contexts/PaymentContext';
import { Trash2, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminApplications() {
  const { projects, fetchProjects, getChosenApplications, approveProjectForUser, rejectProjectForUser, deleteProjectApplication } = useProject();
  const { createPaymentRecord } = usePayment();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [approvingApp, setApprovingApp] = useState<string | null>(null);
  const [totalAmounts, setTotalAmounts] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const loadApps = async () => {
      if (!selectedProjectId) return;
      setLoading(true);
      try {
        const apps = await getChosenApplications(selectedProjectId);
        setApplications(apps);
      } finally {
        setLoading(false);
      }
    };
    loadApps();
  }, [selectedProjectId]);

  const pendingProjects = useMemo(() => {
    return projects.filter(p => p.status === 'pending').map(p => ({ id: p.id, title: p.title }));
  }, [projects]);

  return (
    <div className="p-4 space-y-3">
      <div>
        <h2 className="text-xl font-bold">Chosen Applications Review</h2>
        <p className="text-sm text-gray-600">Review applications chosen by clients</p>
      </div>

      <div className="flex items-center gap-2">
        <select
          className="border rounded-md px-2 py-1.5 text-sm"
          value={selectedProjectId || ''}
          onChange={(e) => setSelectedProjectId(e.target.value || null)}
        >
          <option value="">Select project</option>
          {pendingProjects.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 min-h-[150px]">
        {!selectedProjectId && (
          <div className="text-xs text-gray-600">Choose a project to load chosen applications.</div>
        )}
        {selectedProjectId && loading && (
          <div className="text-xs text-gray-600">Loading applications…</div>
        )}
        {selectedProjectId && !loading && applications.length === 0 && (
          <div className="text-xs text-gray-600">No chosen applications for this project.</div>
        )}
        {selectedProjectId && !loading && applications.length > 0 && (
          <ul className="space-y-2">
            {applications.map((a, idx) => {
              const uid = a.applicantId || a.userId;
              return (
                <li key={idx} className="border rounded p-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{a.fullName}</div>
                    <div className="text-xs text-gray-500">Applied: {new Date(a.appliedAt).toLocaleString()}</div>
                  </div>
                  {a.proposalSummary && (
                    <div className="text-xs text-gray-700 mt-1">Proposal: {a.proposalSummary}</div>
                  )}
                  {a.estimatedDelivery && (
                    <div className="text-xs text-gray-700">Estimated Delivery: {a.estimatedDelivery}</div>
                  )}
                  {a.addOns && (
                    <div className="text-xs text-gray-700">Add-ons: {a.addOns}</div>
                  )}
                  
                  {/* Total Amount Input for Approval */}
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                    <div className="flex items-center gap-1 mb-1">
                      <DollarSign className="w-3 h-3 text-blue-600" />
                      <span className="font-medium text-blue-900">Set Total Amount</span>
                    </div>
                    <input
                      type="number"
                      placeholder="Enter total amount"
                      value={totalAmounts[uid] || ''}
                      onChange={(e) => setTotalAmounts(prev => ({...prev, [uid]: e.target.value}))}
                      className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:ring-1 focus:ring-blue-500"
                      min="1"
                      step="1"
                    />
                    <div className="text-xs text-blue-600 mt-1">
                      Platform fee (10%) will be deducted
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center gap-1">
                    <button
                      className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                        approvingApp === uid 
                          ? 'bg-blue-100 text-blue-700 cursor-not-allowed' 
                          : 'hover:bg-gray-50'
                      }`}
                      disabled={approvingApp === uid}
                      onClick={async () => {
                        if (!uid) {
                          toast.error('No applicant id');
                          return;
                        }
                        
                        const totalAmount = totalAmounts[uid];
                        if (!totalAmount || parseFloat(totalAmount) <= 0) {
                          toast.error('Please enter a valid total amount');
                          return;
                        }
                        
                        setApprovingApp(uid);
                        try {   
                          // First approve the project
                          
                          try {
                            await approveProjectForUser(uid, selectedProjectId!);
  
                          } catch (error) {
                            toast.error('Failed to approve project');
                          }                          
                          // Then create payment record
                          try {
                            await createPaymentRecord(selectedProjectId!, parseFloat(totalAmount));
                          } catch (error) {
                            toast.error('Failed to create payment record');
                          }
                          
                          setApplications(prev => prev.filter(app => (app.applicantId || app.userId) !== uid));
                          toast.success('Project approved and payment record created successfully!');
                        } catch (e: any) {
                          toast.error(e?.message || 'Failed to approve project or create payment');
                        } finally {
                          setApprovingApp(null);
                        }
                      }}
                    >
                      {approvingApp === uid ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      className="px-2 py-0.5 text-xs rounded border hover:bg-gray-50"
                      onClick={async () => {
                        if (!uid) {
                          toast.error('No applicant id');
                          return;
                        }
                        try {
                          await rejectProjectForUser(uid, selectedProjectId!);
                          setApplications(prev => prev.filter(app => (app.applicantId || app.userId) !== uid));
                          toast.success('Application rejected');
                        } catch (e: any) {
                          toast.error(e?.message || 'Failed to reject');
                        }
                      }}
                    >
                      Reject
                    </button>
                    <button
                      title="Delete application"
                      className="px-2 py-0.5 text-xs rounded border hover:bg-gray-50 inline-flex items-center gap-1"
                      onClick={async () => {
                        if (!uid) {
                          toast.error('No applicant id');
                          return;
                        }
                        try {
                          await deleteProjectApplication(selectedProjectId!, uid);
                          setApplications(prev => prev.filter((_, i) => i !== idx));
                          toast.success('Application deleted');
                        } catch (e: any) {
                          toast.error(e?.message || 'Failed to delete');
                        }
                      }}
                    >
                      <Trash2 className="w-2.5 h-2.5" /> Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
