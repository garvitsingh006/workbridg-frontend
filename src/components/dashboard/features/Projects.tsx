import React from "react";
import { FolderOpen, Plus, Filter, Search } from "lucide-react";
import { useProject } from "../../../contexts/ProjectContext";
import { useUser } from "../../../contexts/UserContext";
import CreateProjectModal from "../../modals/CreateProjectModal";
import ProjectDetailsModal from "../../modals/ProjectDetailsModal";
import EditProjectModal from "../../modals/EditProjectModal";
import StatusUpdateModal from "../../modals/StatusUpdateModal";
import ApplyProjectModal from "../../modals/ApplyProjectModal";
import type { Project } from "../../../contexts/ProjectContext";

export default function Projects() {
    const [searchTerm, setSearchTerm] = React.useState("");
    const { projects, applyToProject, fetchProjects } = useProject();
    React.useEffect(() => {
        fetchProjects();
    }, []);
    const { user } = useUser();
    const [createModalOpen, setCreateModalOpen] = React.useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);
    const [editModalOpen, setEditModalOpen] = React.useState(false);
    const [statusModalOpen, setStatusModalOpen] = React.useState(false);
    const [selectedProject, setSelectedProject] =
        React.useState<Project | null>(null);
    const [applyOpen, setApplyOpen] = React.useState(false);

    // Transform projects for display
    const displayProjects = projects
        .filter(
            (project) =>
                project.title
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                project.createdBy.fullName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (project.status &&
                    project.status
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()))
        )
        .map((project) => ({
            id: project.id,
            name: project.title,
            client: project.createdBy.fullName,
            // status: project.createdAt ? new Date(project.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' }) : '-',
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
            budget: project.payment
                ? `$${project.payment.amount.toLocaleString()}`
                : "TBD",
            progress:
                project.status === "completed"
                    ? 100
                    : project.status === "in-progress"
                      ? 25 // TODO
                      : project.status === "pending"
                        ? 0
                        : 0,
        }));

    const getStatusColor = (status: string) => {
        switch (status) {
            case "In Progress":
                return "bg-blue-100 text-blue-800";
            case "Review":
                return "bg-yellow-100 text-yellow-800";
            case "Starting Soon":
                return "bg-gray-100 text-gray-800";
            case "Completed":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            {user?.userType === 'client' && <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        My Projects
                    </h2>
                    <p className="text-gray-600">
                        Manage and track all your freelance projects
                    </p>
                </div>
                {user?.userType === 'client' && (
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Project</span>
                    </button>
                )}
            </div>}

            {/* Filters and Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all w-64"
                            />
                        </div>
                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Sort by:</span>
                        <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                            <option>Recent</option>
                            <option>Deadline</option>
                            <option>Status</option>
                            <option>Budget</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {displayProjects.map((project) => (
                    <div
                        key={project.id}
                        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FolderOpen className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {project.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">{project.client}</p>
                                </div>
                            </div>
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                            >
                                {project.status}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Deadline:</span>
                                <span className="font-medium text-gray-900">
                                    {project.deadline}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Budget:</span>
                                <span className="font-medium text-gray-900">
                                    {project.budget}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                        Progress:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {project.progress}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                        style={{
                                            width: `${project.progress}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    const originalProject = projects.find(
                                        (p) => p.id === project.id
                                    );
                                    if (originalProject) {
                                        setSelectedProject(originalProject);
                                        setDetailsModalOpen(true);
                                    }
                                }}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                View Details
                            </button>
                            <div className="flex items-center space-x-2">
                                {user?.userType !== 'admin' && user?.userType !== "freelancer" && (
                                <button
                                    onClick={() => {
                                        const originalProject = projects.find(
                                            (p) => p.id === project.id
                                        );
                                        if (originalProject) {
                                            setSelectedProject(originalProject);
                                            setEditModalOpen(true);
                                        }
                                    }}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Edit
                                </button>
                                )}
                                {user?.userType !== 'client' && user?.userType !== "freelancer" && (
                                <button
                                    onClick={() => {
                                        const originalProject = projects.find(
                                            (p) => p.id === project.id
                                        );
                                        if (originalProject) {
                                            setSelectedProject(originalProject);
                                            setStatusModalOpen(true);
                                        }
                                    }}
                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Update
                                </button>
                                )}
                                {user?.userType === 'freelancer' && (
                                    <button
                                        onClick={() => {
                                            const originalProject = projects.find((p) => p.id === project.id) || null;
                                            setSelectedProject(originalProject);
                                            setApplyOpen(true);
                                        }}
                                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Apply
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State (if no projects) */}
            {displayProjects.length === 0 && user?.userType === 'client' && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No projects yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Start your freelancing journey by creating your first
                        project
                    </p>
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create Your First Project
                    </button>
                </div>
            )}

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
                onSubmit={async ({ deadline, expectedPayment }) => {
                    if (!selectedProject) return;
                    await applyToProject(selectedProject.id, { deadline, expectedPayment });
                }}
            />
        </div>
    );
}
