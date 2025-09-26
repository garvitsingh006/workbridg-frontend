import { useEffect, useMemo, useState } from 'react';
import { useProject } from '../../../contexts/ProjectContext';
import { Trash2 } from 'lucide-react';

export default function AdminApplications() {
  const { projects, fetchProjects, getProjectApplications, approveProjectForUser, rejectProjectForUser, deleteProjectApplication } = useProject();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [approvedAppIds, setApprovedAppIds] = useState<Set<string>>(new Set());
const [rejectedAppIds, setRejectedAppIds] = useState<Set<string>>(new Set());


  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const loadApps = async () => {
      if (!selectedProjectId) return;
      setLoading(true);
      try {
        const apps = await getProjectApplications(selectedProjectId);
        setApplications(apps);
      } finally {
        setLoading(false);
      }
    };
    loadApps();
  }, [selectedProjectId]);

  const projectOptions = useMemo(() => projects.map(p => ({ id: p.id, title: p.title })), [projects]);

  return (
    <div className="p-4 space-y-3">
      <div>
        <h2 className="text-xl font-bold">Freelancer Applications</h2>
        <p className="text-sm text-gray-600">Select a project to view incoming applications</p>
      </div>

      <div className="flex items-center gap-2">
        <select
          className="border rounded-md px-2 py-1.5 text-sm"
          value={selectedProjectId || ''}
          onChange={(e) => setSelectedProjectId(e.target.value || null)}
        >
          <option value="">Select project</option>
          {projectOptions.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 min-h-[150px]">
        {!selectedProjectId && (
          <div className="text-xs text-gray-600">Choose a project to load applications.</div>
        )}
        {selectedProjectId && loading && (
          <div className="text-xs text-gray-600">Loading applications…</div>
        )}
        {selectedProjectId && !loading && applications.length === 0 && (
          <div className="text-xs text-gray-600">No applications yet for this project.</div>
        )}
        {selectedProjectId && !loading && applications.length > 0 && (
          <ul className="space-y-2">
            {applications.map((a, idx) => {
                const uid = a.applicantId || a.userId;
              const isApproved = approvedAppIds.has(uid);
              const isRejected = rejectedAppIds.has(uid);
              return (<li key={idx} className="border rounded p-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{a.fullName}</div>
                  <div className="text-xs text-gray-500">Applied: {new Date(a.appliedAt).toLocaleString()}</div>
                </div>
                <div className="text-xs text-gray-700 mt-1">Deadline: {new Date(a.deadline).toLocaleDateString()}</div>
                <div className="text-xs text-gray-700">Expected Payment: ${a.expectedPayment.toLocaleString()}</div>
                <div className="mt-1 flex items-center gap-1">
                  {!isApproved && !isRejected && (<><button className="px-2 py-0.5 text-xs rounded border hover:bg-gray-50" onClick={async () => {
                    if (!uid) { setActionMsg('No applicant id'); return; }
                    try {
                        await approveProjectForUser(uid, selectedProjectId!);
                        setApprovedAppIds(prev => new Set(prev).add(uid));
                        setApplications(prev => prev.filter(app => (app.applicantId || app.userId) !== uid));
                        setActionMsg('Approved');
                    } catch (e: any) {
                        setActionMsg(e?.message || 'Failed');
                    }
                  }}>Approve</button>
                  <button className="px-2 py-0.5 text-xs rounded border hover:bg-gray-50" onClick={async () => {
                    if (!uid) { setActionMsg('No applicant id'); return; }
                    try {
                        await rejectProjectForUser(uid, selectedProjectId!);
                        setRejectedAppIds(prev => new Set(prev).add(uid));
                        setApplications(prev => prev.filter(app => (app.applicantId || app.userId) !== uid));
                        setActionMsg('Rejected');
                    } catch (e: any) {
                        setActionMsg(e?.message || 'Failed');
                    }
                  }}>Reject</button> </>)}
                  <button className="px-2 py-0.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => {
                    // Navigate to messages; chat creation handled after selection
                    window.location.hash = `#messages:`;
                    window.dispatchEvent(new CustomEvent('open-messages-feature'));
                    if (!window.location.pathname.includes('/dashboard')) {
                      window.location.href = '/dashboard';
                    }
                  }}>Message</button>
                  <button title="Delete application" className="px-2 py-0.5 text-xs rounded border hover:bg-gray-50 inline-flex items-center gap-1" onClick={async () => {
                    const uid = a.applicantId || a.userId;
                    if (!uid) { setActionMsg('No applicant id'); return; }
                    try {
                      await deleteProjectApplication(selectedProjectId!, uid);
                      setApplications(prev => prev.filter((_, i) => i !== idx));
                      setActionMsg('Application deleted');
                    } catch (e: any) { setActionMsg(e?.message || 'Failed'); }
                  }}>
                    <Trash2 className="w-2.5 h-2.5" /> Delete
                  </button>
                </div>
              </li>)
            })}
          </ul>
        )}
        {actionMsg && <div className="text-xs text-gray-500 mt-2">{actionMsg}</div>}
      </div>
    </div>
  );
}


