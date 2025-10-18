import { useEffect, useMemo, useState } from 'react';
import { useProject, type ProjectApplication } from '../../../contexts/ProjectContext';
import { useUser } from '../../../contexts/UserContext';
import { ArrowUpDown } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface ApplicationWithRating extends ProjectApplication {
  applicantId?: string;
  rating?: number;
}

export default function ClientApplications() {
  const { projects, fetchProjects, getProjectApplications, getChosenApplications, chooseApplicationByClient } = useProject();
  const { user } = useUser();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationWithRating[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'high-to-low' | 'low-to-high' | 'none'>('none');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithRating | null>(null);
  const [hasChosenApplication, setHasChosenApplication] = useState(false);
  const [chosenApplication, setChosenApplication] = useState<ApplicationWithRating | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const loadApps = async () => {
      if (!selectedProjectId) return;
      setLoading(true);
      setHasChosenApplication(false);
      setChosenApplication(null);

      try {
        const selectedProject = projects.find(p => p.id === selectedProjectId);

        if (selectedProject && selectedProject.status === 'pending') {
          const chosenApps = await getChosenApplications(selectedProjectId);

          if (chosenApps.length > 0) {
            const chosenApp = chosenApps[0];
            const uid = (chosenApp as any).applicantId || (chosenApp as any).userId;
            let rating = 0;

            if (uid) {
              try {
                const userRes = await axios.get(`${import.meta.env.VITE_SERVER}/users/${uid}`, { withCredentials: true });
                rating = userRes.data?.data?.rating || userRes.data?.rating || 0;
              } catch (err) {
                console.error('Failed to fetch user rating', err);
              }
            }

            setHasChosenApplication(true);
            setChosenApplication({ ...chosenApp, rating });
            setApplications([]);
          } else {
            setApplications([]);
          }
        } else {
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
        }
      } finally {
        setLoading(false);
      }
    };
    loadApps();
  }, [selectedProjectId, projects]);

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

  const handleChooseApplication = (app: ApplicationWithRating) => {
    setSelectedApplication(app);
    setShowConfirmModal(true);
  };

  const confirmChooseApplication = async () => {
    if (!selectedApplication || !selectedProjectId) return;

    try {
      await chooseApplicationByClient(selectedProjectId, selectedApplication.applicantId!);
      toast.success('Application chosen successfully! Your project is now pending admin approval.');
      setShowConfirmModal(false);
      await fetchProjects();
      setHasChosenApplication(true);
      setChosenApplication(selectedApplication);
      setApplications([]);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to choose application');
    }
  };

  return (
    <div className="p-4 space-y-3">
      <div>
        <h2 className="text-xl font-bold">Project Applications</h2>
        <p className="text-sm text-gray-600">View and choose applications for your projects</p>
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

        {selectedProjectId && !loading && hasChosenApplication && chosenApplication && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-green-700 mb-2">
              You have already chosen an application for this project. It is now pending admin approval.
            </div>
            <div className="border rounded p-3 bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-sm">{chosenApplication.fullName}</div>
                  {chosenApplication.rating !== undefined && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-white rounded text-xs">
                      <span className="text-yellow-600">★</span>
                      <span className="font-medium">{chosenApplication.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500">Applied: {new Date(chosenApplication.appliedAt).toLocaleString()}</div>
              </div>
              <div className="text-xs text-gray-700 mt-1">Deadline: {new Date(chosenApplication.deadline).toLocaleDateString()}</div>
              <div className="text-xs text-gray-700">Expected Payment: ${chosenApplication.expectedPayment.toLocaleString()}</div>
            </div>
          </div>
        )}

        {selectedProjectId && !loading && !hasChosenApplication && sortedApplications.length === 0 && (
          <div className="text-xs text-gray-600">No applications yet for this project.</div>
        )}
        {selectedProjectId && !loading && !hasChosenApplication && sortedApplications.length > 0 && (
          <ul className="space-y-2">
            {sortedApplications.map((a, idx) => {
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
                    <button
                      className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => handleChooseApplication(a)}
                    >
                      Choose This Application
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-2">Confirm Application Selection</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to choose this freelancer? This action cannot be undone and will send the application to the admin for approval.
            </p>
            {selectedApplication && (
              <div className="border rounded p-3 bg-gray-50 mb-4">
                <div className="font-medium text-sm">{selectedApplication.fullName}</div>
                {selectedApplication.rating !== undefined && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-600">★</span>
                    <span className="text-xs font-medium">{selectedApplication.rating.toFixed(1)}</span>
                  </div>
                )}
                <div className="text-xs text-gray-700 mt-1">Expected Payment: ${selectedApplication.expectedPayment.toLocaleString()}</div>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedApplication(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={confirmChooseApplication}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
