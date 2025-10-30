import React from "react";
import { FolderOpen, Plus, ListFilter as Filter, Search, MoreVertical, Calendar, DollarSign, Users } from "lucide-react";
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
    const [filterStatus, setFilterStatus] = React.useState("all");
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

    const displayProjects = projects
        .filter(
            (project) => {
                const matchesSearch =
                    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    project.createdBy.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (project.status && project.status.toLowerCase().includes(searchTerm.toLowerCase()));

                const matchesFilter = filterStatus === "all" || project.status === filterStatus;

                return matchesSearch && matchesFilter;
            }
        )
        .map((project) => ({
            id: project.id,
            name: project.title,
            client: project.createdBy.fullName,
            category: "Development",
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
            budget: project.payment
                ? `$${project.payment.amount.toLocaleString()}`
                : "TBD",
            progress:
                project.status === "completed"
                    ? 100
                    : project.status === "in-progress"
                      ? 25
                      : project.status === "pending"
                        ? 0
                        : 0,
        }));

    const getStatusColor = (status: string) => {
        switch (status) {
            case "In Progress":
                return "bg-purple-100 text-purple-800";
            case "Review":
                return "bg-yellow-100 text-yellow-800";
            case "Starting Soon":
                return "bg-blue-100 text-blue-800";
            case "Completed":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const statusCounts = {
        all: projects.length,
        'in-progress': projects.filter(p => p.status === 'in-progress').length,
        pending: projects.filter(p => p.status === 'pending').length,
        completed: projects.filter(p => p.status === 'completed').length,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Projects
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage and track all your freelance projects
                    </p>
                </div>
                {user?.userType === 'client' && (
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium text-sm shadow-lg shadow-purple-500/30"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New Project</span>
                    </button>
                )}
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0">
                        <button
                            onClick={() => setFilterStatus("all")}
                            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                                filterStatus === "all"
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            All Projects ({statusCounts.all})
                        </button>
                        <button
                            onClick={() => setFilterStatus("in-progress")}
                            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                                filterStatus === "in-progress"
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            In Progress ({statusCounts['in-progress']})
                        </button>
                        <button
                            onClick={() => setFilterStatus("pending")}
                            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                                filterStatus === "pending"
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Pending ({statusCounts.pending})
                        </button>
                        <button
                            onClick={() => setFilterStatus("completed")}
                            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                                filterStatus === "completed"
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Completed ({statusCounts.completed})
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 lg:flex-initial">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full lg:w-64 pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                            <Filter className="w-4 h-4" />
                            <span className="hidden sm:inline">Filter</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Project
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Deadline
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Budget
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {displayProjects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={project.image}
                                                alt={project.name}
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                            <div>
                                                <div className="font-medium text-sm text-gray-900">{project.name}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Users className="w-3 h-3" />
                                                    {project.client}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                                            {project.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                                        >
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm text-gray-700">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            {project.deadline}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 font-semibold text-sm text-gray-900">
                                            <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                                            {project.budget}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
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
                                                className="px-3 py-1.5 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium"
                                            >
                                                View
                                            </button>
                                            {user?.userType === 'freelancer' && (
                                                <button
                                                    onClick={() => {
                                                        const originalProject = projects.find((p) => p.id === project.id) || null;
                                                        setSelectedProject(originalProject);
                                                        setApplyOpen(true);
                                                    }}
                                                    className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                                >
                                                    Apply
                                                </button>
                                            )}
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
                                                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                                <MoreVertical className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing 1 to {displayProjects.length} of {projects.length} results
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                            Previous
                        </button>
                        <button className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                            1
                        </button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                            2
                        </button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {displayProjects.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No projects found
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                        {searchTerm ? "Try adjusting your search or filters" : "Start your freelancing journey by creating your first project"}
                    </p>
                    {user?.userType === 'client' && !searchTerm && (
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                            Create Your First Project
                        </button>
                    )}
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
