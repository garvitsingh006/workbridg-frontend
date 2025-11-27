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
            const uid = (chosenApp as any).applicantId;
            let rating = 0;

            if (uid) {
              try {
                const profileRes = await axios.get(`${import.meta.env.VITE_SERVER}/profiles/user/${uid}`, { withCredentials: true });
                rating = profileRes.data?.data?.rating || profileRes.data?.rating || 0;
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
              const uid = (app as any).applicantId;
              let rating = 0;

              if (uid) {
                try {
                  const profileRes = await axios.get(`${import.meta.env.VITE_SERVER}/profiles/user/${uid}`, { withCredentials: true });
                  rating = profileRes.data?.data?.rating || profileRes.data?.rating || 0;
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
    if (!selectedApplication || !selectedProjectId || !selectedApplication.applicantId) return;

    try {
      await chooseApplicationByClient(selectedProjectId, selectedApplication.applicantId);
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
    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-bold">Project Applications</h2>
        <p className="text-xs sm:text-sm text-gray-600">View and choose applications for your projects</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <select
          className="w-full sm:w-auto border rounded-md px-2 py-1.5 text-sm"
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
            {(() => {
              const selectedProject = projects.find(p => p.id === selectedProjectId);
              const projectStatus = selectedProject?.status;
              
              if (projectStatus === 'in-progress') {
                return (
                  <div className="text-sm font-medium text-blue-700 mb-2">
                    ✅ Project approved! Your chosen freelancer is now working on this project.
                  </div>
                );
              } else if (projectStatus === 'pending') {
                return (
                  <div className="text-sm font-medium text-yellow-700 mb-2">
                    ⏳ You have chosen an application. Waiting for admin approval.
                  </div>
                );
              } else if (projectStatus === 'completed') {
                return (
                  <div className="text-sm font-medium text-green-700 mb-2">
                    ✅ Project completed successfully!
                  </div>
                );
              } else {
                return (
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Application status: {projectStatus}
                  </div>
                );
              }
            })()}
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-semibold text-sm">{chosenApplication.fullName?.charAt(0) || 'U'}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-green-900">{chosenApplication.fullName}</div>
                    {chosenApplication.rating !== undefined && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium text-green-700">{chosenApplication.rating.toFixed(1)}</span>
                        <span className="text-xs text-green-600">rating</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-green-600">
                  Applied {new Date(chosenApplication.appliedAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="space-y-2">
                {chosenApplication.proposalSummary && (
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xs font-medium text-green-700 mb-1">💡 Proposal Summary</div>
                    <div className="text-sm text-gray-800">{chosenApplication.proposalSummary}</div>
                  </div>
                )}
                
                {chosenApplication.estimatedDelivery && (
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">⏱️</span>
                    <div>
                      <div className="text-xs text-green-700">Delivery Time</div>
                      <div className="text-sm font-medium text-gray-800">{chosenApplication.estimatedDelivery}</div>
                    </div>
                  </div>
                )}
                
                {chosenApplication.addOns && (
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xs font-medium text-green-700 mb-1">✨ Additional Services</div>
                    <div className="text-sm text-gray-800">{chosenApplication.addOns}</div>
                  </div>
                )}
              </div>
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
                <li key={idx} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-sm">{a.fullName?.charAt(0) || 'U'}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{a.fullName}</div>
                        {a.rating !== undefined && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm font-medium text-gray-700">{a.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-500">rating</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Applied {new Date(a.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {a.proposalSummary && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-600 mb-1">💡 Proposal Summary</div>
                        <div className="text-sm text-gray-800">{a.proposalSummary}</div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {a.estimatedDelivery && (
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500">⏱️</span>
                          <div>
                            <div className="text-xs text-gray-600">Delivery Time</div>
                            <div className="text-sm font-medium text-gray-800">{a.estimatedDelivery}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {a.addOns && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-green-700 mb-1">✨ Additional Services</div>
                        <div className="text-sm text-green-800">{a.addOns}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
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
                {selectedApplication.proposalSummary && (
                  <div className="text-xs text-gray-700 mt-1">Proposal: {selectedApplication.proposalSummary}</div>
                )}
                {selectedApplication.estimatedDelivery && (
                  <div className="text-xs text-gray-700">Estimated Delivery: {selectedApplication.estimatedDelivery}</div>
                )}
                {selectedApplication.addOns && (
                  <div className="text-xs text-gray-700">Add-ons: {selectedApplication.addOns}</div>
                )}
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