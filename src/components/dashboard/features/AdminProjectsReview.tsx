import React, { useEffect, useMemo, useState } from "react";
import { FolderOpen, ListFilter as Filter, Search, Users } from "lucide-react";
import { useProject } from "../../../contexts/ProjectContext";
import type {
    Project,
    ProjectApplication,
} from "../../../contexts/ProjectContext";
import StatusUpdateModal from "../../modals/StatusUpdateModal";

export default function AdminProjectsReview() {
    const [searchTerm, setSearchTerm] = useState("");
    const { projects, loading, error, fetchProjects, getProjectApplications } =
        useProject();
    const [appsOpen, setAppsOpen] = useState(false);
    const [appsLoading, setAppsLoading] = useState(false);
    const [applications, setApplications] = useState<ProjectApplication[]>([]);
    const [appsProjectTitle, setAppsProjectTitle] = useState("");
    const [selectedProject, setSelectedProject] =
        React.useState<Project | null>(null);
    const [statusModalOpen, setStatusModalOpen] = React.useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const displayProjects = useMemo(() => {
        return projects
            .filter((project) =>
                [
                    project.title,
                    project.createdBy?.fullName || "",
                    project.status || "",
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            )
            .map((project) => ({
                id: project.id,
                name: project.title,
                client:
                    project.createdBy?.fullName ||
                    project.createdBy?.username ||
                    "Unknown",
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
                          ? 75
                          : project.status === "pending"
                            ? 0
                            : 0,
            }));
    }, [projects, searchTerm]);

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
        <div className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Project Review & Moderation
                    </h2>
                    <p className="text-sm text-gray-600">
                        All projects across the platform
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all w-48 text-sm"
                            />
                        </div>
                        <button className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {displayProjects.map((project) => (
                    <div
                        key={project.id}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-2">
                                <div className="p-1.5 bg-blue-100 rounded-lg">
                                    <FolderOpen className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-900">
                                        {project.name}
                                    </h3>
                                    <p className="text-xs text-gray-600">
                                        {project.client}
                                    </p>
                                </div>
                            </div>
                            <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                            >
                                {project.status}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Deadline:</span>
                                <span className="font-medium text-gray-900">
                                    {project.deadline}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Budget:</span>
                                <span className="font-medium text-gray-900">
                                    {project.budget}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">
                                        Progress:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {project.progress}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                                        style={{
                                            width: `${project.progress}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <div className="pt-1">
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
                                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {displayProjects.length === 0 && !loading && !error && (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-gray-900 mb-2">
                        No projects found
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Projects will appear here once available.
                    </p>
                </div>
            )}

            {loading && (
                <div className="text-xs text-gray-600">Loading projects…</div>
            )}

            {appsOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg border w-full max-w-lg">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <div className="font-medium">
                                Applications — {appsProjectTitle}
                            </div>
                            <button
                                className="text-sm text-gray-500 hover:text-gray-700"
                                onClick={() => setAppsOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto">
                            {appsLoading && (
                                <div className="text-sm text-gray-600">
                                    Loading…
                                </div>
                            )}
                            {!appsLoading && applications.length === 0 && (
                                <div className="text-sm text-gray-600">
                                    No applications yet.
                                </div>
                            )}
                            {!appsLoading && applications.length > 0 && (
                                <ul className="space-y-3">
                                    {applications.map((a, idx) => (
                                        <li
                                            key={idx}
                                            className="border rounded p-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium">
                                                    {a.fullName}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Applied:{" "}
                                                    {new Date(
                                                        a.appliedAt
                                                    ).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-700 mt-1">
                                                Deadline:{" "}
                                                {new Date(
                                                    a.deadline
                                                ).toLocaleDateString()}
                                            </div>
                                            <div className="text-sm text-gray-700">
                                                Expected Payment: $
                                                {a.expectedPayment.toLocaleString()}
                                            </div>
                                            <div className="mt-2 flex items-center gap-2">
                                                <button className="px-2 py-1 text-xs rounded border hover:bg-gray-50">
                                                    Shortlist
                                                </button>
                                                <button className="px-2 py-1 text-xs rounded border hover:bg-gray-50">
                                                    Reject
                                                </button>
                                                <button className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
                                                    Message
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <StatusUpdateModal
                isOpen={statusModalOpen}
                onClose={() => {
                    setStatusModalOpen(false);
                    setSelectedProject(null);
                }}
                project={selectedProject}
            />
        </div>
    );
}
