import { useEffect, useMemo, useState } from 'react';
import { useProject, type ProjectApplication } from '../../../contexts/ProjectContext';
import { useUser } from '../../../contexts/UserContext';
import { Trash2, ArrowUpDown } from 'lucide-react';
import axios from 'axios';

interface ApplicationWithRating extends ProjectApplication {
  applicantId?: string;
  rating?: number;
}

export default function ClientApplications() {
  const { projects, fetchProjects, getProjectApplications, approveProjectForUser, rejectProjectForUser, deleteProjectApplication } = useProject();
  const { user } = useUser();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationWithRating[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [approvedAppIds, setApprovedAppIds] = useState<Set<string>>(new Set());
  const [rejectedAppIds, setRejectedAppIds] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'high-to-low' | 'low-to-high' | 'none'>('none');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const loadApps = async () => {
      if (!selectedProjectId) return;
      setLoading(true);
      try {
        const apps = await getProjectApplications(selectedProjectId);

        const appsWithRating = await Promise.all(
          apps.map(async (app) => {
            const uid = (app as any).applicantId || (app as any).userId;
            let rating = 0;

            if (uid) {
              try {
                const userRes = await axios.get(`${import.meta.env.VITE_SERVER}/users/${uid}`, { withCredentials: true });
                rating = userRes.data?.data?.rating || userRes.data?.rating || 0;
              } catch (err) {
                console.error('Failed to fetch user rating', err);
              }
            }

            return { ...app, rating };
          })
        );

        setApplications(appsWithRating);
      } finally {
        setLoading(false);
      }
    };
    loadApps();
  }, [selectedProjectId]);

  const clientProjects = useMemo(() => {
    return projects.filter(p => {
      const creatorId = (p.createdBy as any)?.id || (p.createdBy as any)?._id;
      return creatorId === user?.id;
    });
  }, [projects, user?.id]);

  const sortedApplications = useMemo(() => {
    if (sortOrder === 'none') return applications;

    return [...applications].sort((a, b) => {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;

      if (sortOrder === 'high-to-low') {
        return ratingB - ratingA;
      } else {
        return ratingA - ratingB;
      }
    });
  }, [applications, sortOrder]);

  return (
    <div className="p-4 space-y-3">
      <div>
        <h2 className="text-xl font-bold">Project Applications</h2>
        <p className="text-sm text-gray-600">View and manage applications for your projects</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select
          className="border rounded-md px-2 py-1.5 text-sm"
          value={selectedProjectId || ''}
          onChange={(e) => {
            setSelectedProjectId(e.target.value || null);
            setSortOrder('none');
          }}
        >
          <option value="">Select project</option>
          {clientProjects.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>

        {selectedProjectId && applications.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Sort by rating:</span>
            <button
              onClick={() => setSortOrder(sortOrder === 'high-to-low' ? 'low-to-high' : sortOrder === 'low-to-high' ? 'none' : 'high-to-low')}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded border hover:bg-gray-50"
            >
              <ArrowUpDown className="w-3 h-3" />
              {sortOrder === 'high-to-low' && 'High to Low'}
              {sortOrder === 'low-to-high' && 'Low to High'}
              {sortOrder === 'none' && 'None'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 min-h-[150px]">
        {!selectedProjectId && (
          <div className="text-xs text-gray-600">Choose a project to load applications.</div>
        )}
        {selectedProjectId && loading && (
          <div className="text-xs text-gray-600">Loading applications…</div>
        )}
        {selectedProjectId && !loading && sortedApplications.length === 0 && (
          <div className="text-xs text-gray-600">No applications yet for this project.</div>
        )}
        {selectedProjectId && !loading && sortedApplications.length > 0 && (
          <ul className="space-y-2">
            {sortedApplications.map((a, idx) => {
              const uid = a.applicantId;
              const isApproved = approvedAppIds.has(uid || '');
              const isRejected = rejectedAppIds.has(uid || '');
              return (
                <li key={idx} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm">{a.fullName}</div>
                      {a.rating !== undefined && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs">
                          <span className="text-yellow-600">★</span>
                          <span className="font-medium">{a.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Applied: {new Date(a.appliedAt).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-gray-700 mt-1">Deadline: {new Date(a.deadline).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-700">Expected Payment: ${a.expectedPayment.toLocaleString()}</div>
                  <div className="mt-2 flex items-center gap-1">
                    {!isApproved && !isRejected && (
                      <>
                        <button
                          className="px-2 py-0.5 text-xs rounded border hover:bg-gray-50"
                          onClick={async () => {
                            if (!uid) { setActionMsg('No applicant id'); return; }
                            try {
                              await approveProjectForUser(uid, selectedProjectId!);
                              setApprovedAppIds(prev => new Set(prev).add(uid));
                              setApplications(prev => prev.filter(app => app.applicantId !== uid));
                              setActionMsg('Approved');
                            } catch (e: any) {
                              setActionMsg(e?.message || 'Failed');
                            }
                          }}
                        >
                          Approve
                        </button>
                        <button
                          className="px-2 py-0.5 text-xs rounded border hover:bg-gray-50"
                          onClick={async () => {
                            if (!uid) { setActionMsg('No applicant id'); return; }
                            try {
                              await rejectProjectForUser(uid, selectedProjectId!);
                              setRejectedAppIds(prev => new Set(prev).add(uid));
                              setApplications(prev => prev.filter(app => app.applicantId !== uid));
                              setActionMsg('Rejected');
                            } catch (e: any) {
                              setActionMsg(e?.message || 'Failed');
                            }
                          }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      className="px-2 py-0.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => {
                        window.location.hash = `#messages:`;
                        window.dispatchEvent(new CustomEvent('open-messages-feature'));
                        if (!window.location.pathname.includes('/dashboard')) {
                          window.location.href = '/dashboard';
                        }
                      }}
                    >
                      Message
                    </button>
                    <button
                      title="Delete application"
                      className="px-2 py-0.5 text-xs rounded border hover:bg-gray-50 inline-flex items-center gap-1"
                      onClick={async () => {
                        if (!uid) { setActionMsg('No applicant id'); return; }
                        try {
                          await deleteProjectApplication(selectedProjectId!, uid);
                          setApplications(prev => prev.filter((_, i) => i !== idx));
                          setActionMsg('Application deleted');
                        } catch (e: any) {
                          setActionMsg(e?.message || 'Failed');
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
        {actionMsg && <div className="text-xs text-gray-500 mt-2">{actionMsg}</div>}
      </div>
    </div>
  );
}
