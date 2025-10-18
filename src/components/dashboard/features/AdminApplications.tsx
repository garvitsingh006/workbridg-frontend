import { useEffect, useMemo, useState } from 'react';
import { useProject } from '../../../contexts/ProjectContext';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminApplications() {
  const { projects, fetchProjects, getChosenApplications, approveProjectForUser, rejectProjectForUser, deleteProjectApplication } = useProject();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
                  <div className="text-xs text-gray-700 mt-1">Deadline: {new Date(a.deadline).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-700">Expected Payment: ${a.expectedPayment.toLocaleString()}</div>
                  <div className="mt-1 flex items-center gap-1">
                    <button
                      className="px-2 py-0.5 text-xs rounded border hover:bg-gray-50"
                      onClick={async () => {
                        if (!uid) {
                          toast.error('No applicant id');
                          return;
                        }
                        try {
                          await approveProjectForUser(uid, selectedProjectId!);
                          setApplications(prev => prev.filter(app => (app.applicantId || app.userId) !== uid));
                          toast.success('Project approved successfully! Group chat created.');
                        } catch (e: any) {
                          toast.error(e?.message || 'Failed to approve');
                        }
                      }}
                    >
                      Approve
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
