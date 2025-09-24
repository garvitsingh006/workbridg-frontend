import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "./UserContext";
import axios from "axios";

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

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(
                `${import.meta.env.VITE_SERVER}/projects/all`,
                { withCredentials: true }
            );
            const projectsData = response.data.data;
            setProjects(projectsData);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch projects"
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectById = async (
        projectId: string
    ): Promise<Project | null> => {
        try {
            setError(null);

            const response = await axios.get(
                `${import.meta.env.VITE_SERVER}/projects/${projectId}`,
                { withCredentials: true }
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

            const response = await axios.post(
                `${import.meta.env.VITE_SERVER}/projects/new`,
                projectData,
                { withCredentials: true }
            );
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

            const response = await axios.patch(
                `${import.meta.env.VITE_SERVER}/projects/${projectId}`,
                projectData,
                { withCredentials: true }
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

            await axios.delete(
                `${import.meta.env.VITE_SERVER}/projects/${projectId}`,
                {
                    withCredentials: true,
                }
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

            const response = await axios.post(
                `${import.meta.env.VITE_SERVER}/projects/${projectId}/remarks`,
                { userId, text },
                { withCredentials: true }
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
