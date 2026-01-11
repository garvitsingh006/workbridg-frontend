import React from "react";
import { FolderOpen, Plus, ListFilter as Calendar, RefreshCw, HelpCircle } from "lucide-react";
import { useProject } from "../../../contexts/ProjectContext";
import { useUser } from "../../../contexts/UserContext";
import CreateProjectModal from "../../modals/CreateProjectModal";
import ProjectDetailsModal from "../../modals/ProjectDetailsModal";
import EditProjectModal from "../../modals/EditProjectModal";
import StatusUpdateModal from "../../modals/StatusUpdateModal";
import ApplyProjectModal from "../../modals/ApplyProjectModal";
import type { Project } from "../../../contexts/ProjectContext";
import Joyride, {type CallBackProps, STATUS, type Step, type Placement } from 'react-joyride';
import { toast } from 'react-toastify';

export default function Projects() {
    const [projectName, setProjectName] = React.useState("");
    const [budgetMin, setBudgetMin] = React.useState("");
    const [budgetMax, setBudgetMax] = React.useState("");
    const [category, setCategory] = React.useState("");
    const { projects, applyToProject, fetchProjects, deleteProject, requestAdminManagement } = useProject();
    const { user, updateUser } = useUser();
    
    React.useEffect(() => {
        fetchProjects();
    }, []);
    
    const [runTour, setRunTour] = React.useState(false);
    
    React.useEffect(() => {
        if (user?.userType === 'client' && user?.hasSeenProjectsOnboarding === false && !runTour) {
            const timer = setTimeout(() => {
                setRunTour(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [user, runTour]);
    
    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
        
        if (finishedStatuses.includes(status)) {
            setRunTour(false);
            markOnboardingComplete();
        }
    };
    
    const markOnboardingComplete = async () => {
        try {
            await updateUser({ hasSeenProjectsOnboarding: true });
        } catch (error) {
            console.error('Failed to update onboarding status:', error);
        }
    };
    const [createModalOpen, setCreateModalOpen] = React.useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);
    const [editModalOpen, setEditModalOpen] = React.useState(false);
    const [statusModalOpen, setStatusModalOpen] = React.useState(false);
    const [selectedProject, setSelectedProject] =
        React.useState<Project | null>(null);
    const [applyOpen, setApplyOpen] = React.useState(false);
    // const [dropdownOpen, setDropdownOpen] = React.useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
    const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null);
    const [adminManagementConfirmOpen, setAdminManagementConfirmOpen] = React.useState(false);
    const [projectForAdminManagement, setProjectForAdminManagement] = React.useState<Project | null>(null);

    const categories = [
        'Development',
        'Design', 
        'Writing',
        'Marketing',
        'Video & Animation',
        'Audio & Music',
        'Business & Consulting',
        'Data & AI',
        'Support & Admin',
        'Other'
    ];

    const applyFilters = () => {
        // Filters are applied in displayProjects calculation
    };

    const resetFilters = () => {
        setProjectName('');
        setBudgetMin('');
        setBudgetMax('');
        setCategory('');
    };

    const displayProjects = projects
        .filter((project) => {
            // Project name filter
            const nameMatch = !projectName || project.title.toLowerCase().includes(projectName.toLowerCase());
            
            // Budget filter
            const budget = project.budget || 0;
            const minBudget = budgetMin ? parseFloat(budgetMin) : 0;
            const maxBudget = budgetMax ? parseFloat(budgetMax) : Infinity;
            const budgetMatch = budget >= minBudget && budget <= maxBudget;
            
            // Category filter
            const categoryMatch = !category || project.category === category;

            // For freelancers, only show unassigned projects (Starting Soon)
            const freelancerFilter = user?.userType === 'freelancer' ? project.status === 'unassigned' : true;

            return nameMatch && budgetMatch && categoryMatch && freelancerFilter;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((project) => ({
            id: project.id,
            name: project.title,
            client: project.createdBy?.fullName || 'Unknown Client',
            category: project.category || "Other",
            image: "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=200",
            status:
                    project.status === "in-progress"
                        ? "In Progress"
                        : project.status === "pending"
                          ? "Review"
                          : project.status === "unassigned"
                            ? "Starting Soon"
                            : project.status === "completed"
                              ? "Completed"
                              : "Cancelled",
            deadline: project.deadline
                ? new Date(project.deadline).toLocaleDateString()
                : "No deadline",
            budget: project.budget
                ? `₹${project.budget.toLocaleString()}`
                : "₹0",
            progress:
                project.status === "completed"
                    ? 100
                    : project.status === "in-progress"
                      ? 25
                      : project.status === "pending"
                        ? 0
                        : 0,
        }));

    const tourSteps: Step[] = [
        {
            target: 'body',
            content: (
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Projects! 🚀</h2>
                    <p className="text-gray-600">Let me show you around your project management dashboard. This is where you can create, manage, and track all your projects.</p>
                </div>
            ),
            placement: 'center' as Placement
        },
        {
            target: '[data-intro="add-project"]',
            content: (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Projects</h3>
                    <p className="text-gray-600">Click here to create a new project. You can set the title, description, budget, deadline, and category for your project.</p>
                </div>
            ),
            placement: 'bottom' as Placement
        },
        {
            target: '[data-intro="filters"]',
            content: (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Filter & Search</h3>
                    <p className="text-gray-600">Use these filters to search and organize your projects by name, budget range, or category.</p>
                </div>
            ),
            placement: 'bottom' as Placement
        },
        {
            target: '[data-intro="project-card"]',
            content: (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Cards</h3>
                    <p className="text-gray-600">Each project is displayed as a card showing key information like status, budget, deadline, and description. Click on any card to view full details.</p>
                </div>
            ),
            placement: 'top' as Placement
        },
        // ...(user?.userType === 'client' && displayProjects.some(p => projects.find(orig => orig.id === p.id)?.status === 'unassigned') ? [{
        //     target: '[data-intro="edit-delete"]',
        //     content: (
        //         <div>
        //             <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Projects</h3>
        //             <p className="text-gray-600">For unassigned projects, you can edit project details or delete the project entirely. Once a project is assigned to a freelancer, editing is restricted.</p>
        //         </div>
        //     ),
        //     placement: 'top' as Placement
        // }] : []),
        {
            target: 'body',
            content: (
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">You're All Set! 🎉</h2>
                    <p className="text-gray-600">You now know how to manage your projects effectively. Start by creating your first project and watch freelancers apply to work with you!</p>
                </div>
            ),
            placement: 'center' as Placement
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "In Progress":
                return "bg-blue-50 text-blue-700";
            case "Review":
                return "bg-amber-50 text-amber-700";
            case "Starting Soon":
                return "bg-indigo-50 text-indigo-700";
            case "Completed":
                return "bg-emerald-50 text-emerald-700";
            default:
                return "bg-gray-50 text-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Projects
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage and track all your freelance projects
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchProjects}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                    {user?.userType === 'client' && (
                        <button
                            data-intro="add-project"
                            onClick={() => setCreateModalOpen(true)}
                            className="flex items-center gap-2 bg-linear-to-r from-[#f72585] to-[#f72585] text-white px-4 py-2 rounded-md hover:from-[#f72585] hover:to-[#f72585] transition-all font-medium text-sm shadow-lg shadow-[#f72585]/30 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add New Project</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div data-intro="filters" className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Project Name</label>
                        <input
                            type="text"
                            placeholder="Enter project name"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Min Budget (₹)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={budgetMin}
                            onChange={(e) => setBudgetMin(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Max Budget (₹)</label>
                        <input
                            type="number"
                            placeholder="No limit"
                            value={budgetMax}
                            onChange={(e) => setBudgetMax(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-sm"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={applyFilters}
                        className="px-4 py-2 bg-linear-to-r from-[#f72585] to-[#f72585] text-white rounded-md hover:from-[#f72585] hover:to-[#f72585] transition-all font-medium text-sm shadow-lg shadow-[#f72585]/30 cursor-pointer"
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm cursor-pointer"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayProjects.map((project, index) => {
                    const originalProject = projects.find((p) => p.id === project.id);
                    console.log("ORIGINAL PROJECT:", originalProject?.hasRequestedAdminManagement);
                    const description = originalProject?.description || '';
                    
                    // Check if project is eligible for admin management (within 48 hours and in-progress)
                    const isEligibleForAdminManagement = originalProject && 
                        originalProject.status === 'in-progress' && 
                        !originalProject.hasRequestedAdminManagement &&
                        user?.userType === 'client' &&
                        originalProject.createdBy?.id === user?.id;
                    
                    const projectAge = originalProject ? Date.now() - new Date(originalProject.createdAt).getTime() : 0;
                    const fortyEightHours = 48 * 60 * 60 * 1000;
                    const isWithin48Hours = projectAge <= fortyEightHours;
                    
                    const showAdminManagementButton = isEligibleForAdminManagement && isWithin48Hours && !originalProject.hasRequestedAdminManagement;
                    
                    return (
                        <div
                            key={project.id}
                            data-intro={index === 0 ? "project-card" : undefined}
                            onClick={() => {
                                if (originalProject) {
                                    setSelectedProject(originalProject);
                                    setDetailsModalOpen(true);
                                }
                            }}
                            className="bg-white rounded-lg border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                                        {project.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                                        {description ? (description.split(' ').length > 100 ? description.split(' ').slice(0, 100).join(' ') + '...' : description) : 'No description provided'}
                                    </p>
                                </div>
                                <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded border text-xs font-medium ml-3 shrink-0">
                                    {project.category}
                                </span>
                            </div>

                            {/* Status and Deadline */}
                            <div className="flex items-center justify-between mb-4">
                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(project.status)}`}>
                                    {project.status}
                                </span>
                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs">{project.deadline}</span>
                                </div>
                            </div>

                            {/* Budget and Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="text-lg font-semibold text-gray-900">
                                    {project.budget}
                                </div>
                                
                                {/* Admin Management Button or Status */}
                                {originalProject?.hasRequestedAdminManagement ? (
                                    <div className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-sm font-medium border border-gray-300">
                                        Under Admin Management
                                    </div>
                                ) : showAdminManagementButton ? (
                                    <div className="relative">
                                        <div className="group relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setProjectForAdminManagement(originalProject);
                                                    setAdminManagementConfirmOpen(true);
                                                }}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium text-sm cursor-pointer"
                                            >
                                                Request Admin Management (+5%)
                                                <HelpCircle className="w-3 h-3" />
                                            </button>
                                            <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                <div className="space-y-1">
                                                    <div className="font-semibold text-orange-300 mb-2">Time remaining: {Math.max(0, Math.ceil((fortyEightHours - projectAge) / (1000 * 60 * 60)))} hours</div>
                                                    <div>• Admin will take control of the project</div>
                                                    <div>• Group chat will be locked</div>
                                                    <div>• Scope and requirements will be finalized by admin</div>
                                                    <div>• The decision is irreversible</div>
                                                    <div>• Client waives the right to change requirements</div>
                                                    <div className="font-semibold text-yellow-300 mt-2">• 5% extra charge will be added to final payment</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                                {user?.userType === 'freelancer' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedProject(originalProject || null);
                                            setApplyOpen(true);
                                        }}
                                        className="px-3 py-1.5 bg-linear-to-r from-[#f72585] to-[#f72585] text-white rounded-md hover:from-[#f72585] hover:to-[#f72585] transition-all font-medium text-sm shadow-lg shadow-[#f72585]/30 cursor-pointer"
                                    >
                                        Apply
                                    </button>
                                )}
                                {user?.userType !== 'admin' && user?.userType !== "freelancer" && originalProject?.status === 'unassigned' && (
                                    <div 
                                        data-intro={index === 0 ? "edit-delete" : undefined} 
                                        className="flex gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (originalProject) {
                                                    setSelectedProject(originalProject);
                                                    setEditModalOpen(true);
                                                }
                                            }}
                                            className="px-3 py-1.5 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm cursor-pointer"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (originalProject) {
                                                    setProjectToDelete(originalProject);
                                                    setDeleteConfirmOpen(true);
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium text-sm cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {displayProjects.length === 0 && (
                <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="w-6 h-6 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No projects found
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                        {projectName ? "Try adjusting your search or filters" : "Start your freelancing journey by creating your first project"}
                    </p>
                    {user?.userType === 'client' && !projectName && (
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="bg-linear-to-r from-[#f72585] to-[#f72585] text-white px-6 py-2.5 rounded-md hover:from-[#f72585] hover:to-[#f72585] transition-all text-sm font-medium shadow-lg shadow-[#f72585]/30 cursor-pointer"
                        >
                            Create Your First Project
                        </button>
                    )}
                </div>
            )}

            {/* Tour Component */}
            <Joyride
                steps={tourSteps}
                run={runTour}
                continuous
                showProgress
                showSkipButton
                callback={handleJoyrideCallback}
                scrollToFirstStep
                scrollOffset={100}
                disableOverlayClose
                spotlightClicks
                floaterProps={{
                    disableAnimation: false,
                    styles: {
                        floater: {
                            transition: 'opacity 400ms ease-out'
                        }
                    }
                }}
                styles={{
                    overlay: {
                        transition: 'all 2s ease-in-out'
                    },
                    spotlight: {
                        borderRadius: 8,
                        transition: 'opacity 1s ease-in-out',
                        opacity: 0.7
                    },
                    tooltip: {
                        borderRadius: 12,
                        padding: 20,
                        fontSize: 14,
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                        border: '1px solid #e5e7eb',
                        transition: 'all 2s ease-in-out',
                        backgroundColor: '#ffffff',
                        color: '#374151'
                    },
                    tooltipContainer: {
                        textAlign: 'left'
                    },
                    buttonNext: {
                        backgroundColor: '#f72585',
                        borderRadius: 8,
                        padding: '8px 16px',
                        fontSize: 14,
                        fontWeight: 500,
                        border: 'none',
                        boxShadow: '0 2px 4px rgba(247, 37, 133, 0.2)'
                    },
                    buttonBack: {
                        color: '#6b7280',
                        marginRight: 10,
                        fontSize: 14,
                        fontWeight: 500,
                        border: 'none',
                        backgroundColor: 'transparent'
                    },
                    buttonSkip: {
                        color: '#6b7280',
                        fontSize: 14,
                        fontWeight: 500,
                        border: 'none',
                        backgroundColor: 'transparent'
                    }
                }}
                locale={{
                    back: '← Back',
                    close: 'Close',
                    last: 'Got it!',
                    next: 'Next →',
                    skip: 'Skip tour'
                }}
            />

            {/* Modals */}
            <CreateProjectModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
            />

            <ProjectDetailsModal
                isOpen={detailsModalOpen}
                onClose={() => {
                    setDetailsModalOpen(false);
                    setSelectedProject(null);
                }}
                project={selectedProject}
                onEdit={(project) => {
                    setDetailsModalOpen(false);
                    setSelectedProject(project);
                    setEditModalOpen(true);
                }}
                onApply={(project) => {
                    setDetailsModalOpen(false);
                    setSelectedProject(project);
                    setApplyOpen(true);
                }}
            />

            <EditProjectModal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setSelectedProject(null);
                }}
                project={selectedProject}
            />

            <StatusUpdateModal
                isOpen={statusModalOpen}
                onClose={() => {
                    setStatusModalOpen(false);
                    setSelectedProject(null);
                }}
                project={selectedProject}
            />
            <ApplyProjectModal
                isOpen={applyOpen}
                onClose={() => setApplyOpen(false)}
                onSubmit={async ({proposalSummary, estimatedDelivery, addOns, }) => {
                    if (!selectedProject) return;
                    await applyToProject(selectedProject.id, { proposalSummary, estimatedDelivery, addOns });
                }}
            />

            {/* Delete Confirmation Modal */}
            {deleteConfirmOpen && projectToDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{projectToDelete.title}"? This action cannot be undone.
                        </p>
                        <div className="flex items-center justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setDeleteConfirmOpen(false);
                                    setProjectToDelete(null);
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await deleteProject(projectToDelete.id);
                                        await fetchProjects();
                                    } catch (error) {
                                        console.error('Error deleting project:', error);
                                    }
                                    setDeleteConfirmOpen(false);
                                    setProjectToDelete(null);
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Management Confirmation Modal */}
            {adminManagementConfirmOpen && projectForAdminManagement && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Admin Management</h3>
                        <div className="text-gray-600 mb-6 space-y-2">
                            <p className="font-medium text-red-600">This action is irreversible</p>
                            <p className="font-medium text-orange-600">5% extra charge will be added to your final payment</p>
                            <ul className="space-y-1 text-sm">
                                <li>• Group chat will become read-only</li>
                                <li>• Only admin can post in the group</li>
                                <li>• Client waives the right to modify scope or requirements</li>
                                <li>• Admin will finalize project scope, deliverables, timeline, and payment</li>
                            </ul>
                        </div>
                        <div className="flex items-center justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setAdminManagementConfirmOpen(false);
                                    setProjectForAdminManagement(null);
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await requestAdminManagement(projectForAdminManagement.id);
                                        toast.success('Project is now under admin management! 🎯');
                                        await fetchProjects();
                                    } catch (error) {
                                        console.error('Error requesting admin management:', error);
                                        toast.error('Failed to request admin management. Please try again.');
                                    }
                                    setAdminManagementConfirmOpen(false);
                                    setProjectForAdminManagement(null);
                                }}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer"
                            >
                                Confirm Request
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
        </div>
    );
}
