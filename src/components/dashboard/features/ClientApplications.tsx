import { useEffect, useMemo, useState } from 'react';
import { useProject, type ProjectApplication } from '../../../contexts/ProjectContext';
import { useUser } from '../../../contexts/UserContext';
import { ArrowUpDown, ChevronDown, FolderOpen } from 'lucide-react';
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
      const isMyProject = creatorId === user?.id;
      // Only show projects that don't have a freelancer assigned
      const hasNoAssignedFreelancer = !p.assignedTo;
      return isMyProject && hasNoAssignedFreelancer;
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Project Applications</h1>
          <p className="text-slate-600">Review and select the best freelancer for your projects</p>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Project Selector */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Project
              </label>
              <div className="relative">
                <select
                  className="w-full h-12 pl-4 pr-10 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-colors appearance-none shadow-sm"
                  value={selectedProjectId || ''}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value || null);
                    setSortOrder('none');
                  }}
                >
                  <option value="">Choose a project to view applications</option>
                  {clientProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Sort Controls */}
            {selectedProjectId && applications.length > 0 && (
              <div className="lg:w-64">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sort by Rating
                </label>
                <button
                  onClick={() => setSortOrder(sortOrder === 'high-to-low' ? 'low-to-high' : sortOrder === 'low-to-high' ? 'none' : 'high-to-low')}
                  className="w-full h-12 px-4 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-colors flex items-center justify-between shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    {sortOrder === 'high-to-low' && 'High to Low'}
                    {sortOrder === 'low-to-high' && 'Low to High'}
                    {sortOrder === 'none' && 'Default Order'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
          {!selectedProjectId && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                <FolderOpen className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a Project</h3>
              <p className="text-slate-600 max-w-md">
                Choose one of your projects from the dropdown above to view and manage applications from freelancers.
              </p>
            </div>
          )}

          {selectedProjectId && loading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-slate-600">Loading applications...</span>
              </div>
            </div>
          )}

          {selectedProjectId && !loading && hasChosenApplication && chosenApplication && (
            <div className="p-6">
              {(() => {
                const selectedProject = projects.find(p => p.id === selectedProjectId);
                const projectStatus = selectedProject?.status;
                const hasAssignedFreelancer = selectedProject?.assignedTo;
                
                // If project has assigned freelancer, show the selected application
                if (hasAssignedFreelancer) {
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
                } else {
                  return (
                    <div className="text-sm font-medium text-yellow-700 mb-2">
                      ⏳ You have chosen an application. Waiting for admin approval.
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
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Applications Yet</h3>
              <p className="text-slate-600 max-w-md">
                This project hasn't received any applications from freelancers yet. Applications will appear here once freelancers start applying.
              </p>
            </div>
          )}

          {selectedProjectId && !loading && !hasChosenApplication && sortedApplications.length > 0 && (
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  Applications ({sortedApplications.length})
                </h3>
                <p className="text-slate-600 text-sm">
                  Review each application and choose the best freelancer for your project
                </p>
              </div>
              <ul className="space-y-4">
                {sortedApplications.map((a, idx) => {
                  return (
                    <li key={idx} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#f72585]/10 rounded-full flex items-center justify-center">
                            <span className="text-[#f72585] font-semibold text-sm">{a.fullName?.charAt(0) || 'U'}</span>
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
                          className="px-4 py-2 text-sm font-medium rounded-lg bg-[#f72585] text-white hover:bg-[#f72585]/90 transition-colors"
                          onClick={() => handleChooseApplication(a)}
                        >
                          Choose This Application
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Confirm Application Selection</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to choose this freelancer? This action cannot be undone and will send the application to the admin for approval.
            </p>
            {selectedApplication && (
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 mb-6">
                <div className="font-semibold text-gray-900 mb-2">{selectedApplication.fullName}</div>
                {selectedApplication.rating !== undefined && (
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium text-gray-700">{selectedApplication.rating.toFixed(1)} rating</span>
                  </div>
                )}
                {selectedApplication.proposalSummary && (
                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Proposal:</span> {selectedApplication.proposalSummary}
                  </div>
                )}
                {selectedApplication.estimatedDelivery && (
                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Estimated Delivery:</span> {selectedApplication.estimatedDelivery}
                  </div>
                )}
                {selectedApplication.addOns && (
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Add-ons:</span> {selectedApplication.addOns}
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                className="px-6 py-2.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedApplication(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                onClick={confirmChooseApplication}
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}