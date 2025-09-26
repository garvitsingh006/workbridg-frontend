import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "./UserContext";
import api from "../api";
import { useUser } from "./UserContext";
import { useChat } from "./ChatContext";

// Types for Project Context
export interface Remark {
    by: User;
    text: string;
    createdAt: Date;
}

export interface Payment {
    id: string;
    amount: number;
    status: "pending" | "completed" | "failed";
    createdAt: Date;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    assignedTo?: User; // freelancer
    createdBy: User; // client
    status:
        | "unassigned"
        | "pending"
        | "in-progress"
        | "completed"
        | "cancelled";
    deadline: Date;
    remarks: Remark[];
    payment?: Payment;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProjectApplication {
    fullName: string;
    deadline: string;
    expectedPayment: number;
    appliedAt: string;
}

// Project methods interface
export interface ProjectMethods {
    updateStatus: (
        projectId: string,
        newStatus: Project["status"]
    ) => Promise<void>;
    markCompleted: (projectId: string) => Promise<void>;
    addRemark: (
        projectId: string,
        userId: string,
        text: string
    ) => Promise<void>;
}

interface ProjectContextType {
    projects: Project[];
    loading: boolean;
    error: string | null;
    fetchProjects: () => Promise<void>;
    applyToProject: (projectId: string, payload: { deadline: string; expectedPayment: number }) => Promise<void>;
    getProjectApplications: (projectId: string) => Promise<ProjectApplication[]>;
    approveProjectForUser: (userId: string, projectId: string) => Promise<void>;
    rejectProjectForUser: (userId: string, projectId: string) => Promise<void>;
    deleteProjectApplication: (projectId: string, userId: string) => Promise<void>;
    fetchProjectById: (projectId: string) => Promise<Project | null>;
    createProject: (projectData: Partial<Project>) => Promise<Project>;
    updateProject: (
        projectId: string,
        projectData: Partial<Project>
    ) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    // Project methods
    updateStatus: (
        projectId: string,
        newStatus: Project["status"]
    ) => Promise<void>;
    markCompleted: (projectId: string) => Promise<void>;
    addRemark: (
        projectId: string,
        userId: string,
        text: string
    ) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error("useProject must be used within a ProjectProvider");
    }
    return context;
};

interface ProjectProviderProps {
    children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({
    children,
}) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();
    
    
    
    // We'll use this to create group chats when projects are approved
    const createGroupChatForProject = async (projectId: string, clientId: string, freelancerId: string) => {
        try {
            // This will be called after a freelancer is approved for a project
            const response = await api.post(
                `/chats/group`,
                {
                    project: projectId,
                    participantIds: [clientId, freelancerId]
                }
            );
            return response.data?.data || response.data;
        } catch (error) {
            console.error('Failed to create project group chat:', error);
            throw error;
        }
    };

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);

            const endpoint = (user?.userType === "admin" || user?.userType === "freelancer")
                ? `/projects/users/all`
                : `/projects/all`;

            const response = await api.get(endpoint);
            let projectsData: Project[] = response.data.data;

            // If freelancer, remove rejected projects so they can't see or re-apply
            if (user?.userType === 'freelancer' && user?.id) {
                try {
                    const rejRes = await api.get(`/users/${user.id}/projects/rejected`);
                    const rejected: any[] = rejRes.data?.data || [];
                    const rejectedIds = new Set(rejected.map((p: any) => p.id || p._id));
                    projectsData = projectsData.filter((p: any) => !rejectedIds.has(p.id || p._id));
                } catch (_) {
                    // ignore filtering issues
                }
            }
            setProjects(projectsData);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch projects"
            );
        } finally {
            setLoading(false);
        }
    };

    const applyToProject = async (
        projectId: string,
        payload: { deadline: string; expectedPayment: number }
      ): Promise<void> => {
        try {
          setError(null);
          await api.post(
            `/projects/${projectId}/apply`,
            payload,
          );
        } catch (err: any) {
          const message = err?.response?.data?.message || err?.message || "Failed to apply to project";
          setError(message);
          // Throw a clean Error with backend message so UI can show it
          throw new Error(message);
        }
      };
      
    const getProjectApplications = async (
        projectId: string
    ): Promise<(ProjectApplication & { applicantId?: string })[]> => {
        try {
            setError(null);
            const res = await api.get(
                `/projects/${projectId}/applications`
            );
            const raw = res.data?.data || [];
            // Normalize and include applicantId from populated applicant
            return (Array.isArray(raw) ? raw : []).map((app: any) => ({
                fullName: app.fullName || app.applicant?.fullName,
                deadline: app.deadline,
                expectedPayment: app.expectedPayment,
                appliedAt: app.appliedAt,
                applicantId: app.applicant?._id || app.applicantId || app.userId || undefined,
            }));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch project applications"
            );
            return [];
        }
    };

    const approveProjectForUser = async (userId: string, projectId: string): Promise<void> => {
        try {
            setError(null);
            const response = await api.post(
                `/users/${userId}/projects/approve`, 
                { projectId }
            );
            
            // Get project and client details to create group chat
            const project = projects.find(p => p.id === projectId);
            if (project && project.createdBy) {
                try {
                    // Create group chat automatically
                    await createGroupChatForProject(projectId, project.createdBy.id, userId);
                } catch (chatError) {
                    console.error('Failed to create group chat, but project was approved:', chatError);
                    // Don't throw here - project approval succeeded
                }
            }
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Failed to approve project';
            setError(message);
            throw new Error(message);
        }
    };

    const rejectProjectForUser = async (userId: string, projectId: string): Promise<void> => {
        try {
            setError(null);
            await api.post(`/users/${userId}/projects/reject`, { projectId });
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Failed to reject project';
            setError(message);
            throw new Error(message);
        }
    };

    const deleteProjectApplication = async (projectId: string, userId: string): Promise<void> => {
        try {
            setError(null);
            await api.delete(`/projects/${projectId}/applications/${userId}`);
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Failed to delete application';
            setError(message);
            throw new Error(message);
        }
    };

    const fetchProjectById = async (
        projectId: string
    ): Promise<Project | null> => {
        try {
            setError(null);

            const response = await api.get(
                `/projects/${projectId}`
            );
            return response.data.data; // formatted project object from backend
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch project"
            );
            return null;
        }
    };

    const createProject = async (
        projectData: Partial<Project>
    ): Promise<Project> => {
        try {
            setError(null);

            const response = await api.post(
                `/projects/new`,
                projectData
            );
            console.log(projectData)
            const newProject = response.data.data;
            setProjects((prev) => [...prev, newProject]);
            return newProject;
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to create project"
            );
            throw err;
        }
    };

    const updateProject = async (
        projectId: string,
        projectData: Partial<Project>
    ) => {
        try {
            setError(null);

            const response = await api.patch(
                `/projects/${projectId}`,
                projectData
            );
            const updatedProject = response.data.data;
            setProjects((prev) =>
                prev.map((project) =>
                    project.id === projectId ? updatedProject : project
                )
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to update project"
            );
            throw err;
        }
    };

    const deleteProject = async (projectId: string) => {
        try {
            setError(null);

            await api.delete(
                `/projects/${projectId}`
            );

            setProjects((prev) =>
                prev.filter((project) => project.id !== projectId)
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to delete project"
            );
            throw err;
        }
    };

    // Project methods
    const updateStatus = async (
        projectId: string,
        newStatus: Project["status"]
    ) => {
        await updateProject(projectId, { status: newStatus });
    };

    const markCompleted = async (projectId: string) => {
        await updateProject(projectId, { status: "completed" });
    };

    const addRemark = async (
        projectId: string,
        userId: string,
        text: string
    ) => {
        try {
            setError(null);

            const response = await api.post(
                `/projects/${projectId}/remarks`,
                { userId, text }
            );

            const updatedProject = response.data.data; // full updated project
            setProjects((prev) =>
                prev.map((project) =>
                    project.id === projectId ? updatedProject : project
                )
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to add remark"
            );
            throw err;
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const value: ProjectContextType = {
        projects,
        loading,
        error,
        fetchProjects,
        applyToProject,
        getProjectApplications,
        approveProjectForUser,
        rejectProjectForUser,
        deleteProjectApplication,
        fetchProjectById,
        createProject,
        updateProject,
        deleteProject,
        updateStatus,
        markCompleted,
        addRemark,
    };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
};
