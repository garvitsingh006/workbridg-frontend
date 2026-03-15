import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import api from "../api";

// Types for User Context
export interface WorkExperience {
    title: string;
    company?: string;
    years: number;
    description?: string;
}

export interface FreelancerDetails {
    location?: string;
    workField: string;
    workExperience: WorkExperience[];
    skills: string[];
    linkedIn?: string;
    github?: string;
    preferredRole?: string;
    resume?: string;
    bio?: string;
    isInterviewed?: boolean;
    rating?: number;
    ratingCount?: number;
    completedProjects?: number;
    earnings?: number;
}

export interface ClientDetails {
    companyName: string;
    industry: string;
    companySize?: string;
    location: string;
    website?: string;
    linkedIn?: string;
    projectTypes: string[];
    budgetRange: string;
    preferredCommunication: string;
    companyDescription: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    userType: "freelancer" | "client" | "admin" | "interviewer";
    isVerified?: boolean;
    isPremium?: boolean;
    freelancerDetails?: FreelancerDetails;
    clientDetails?: ClientDetails;
    hasSeenProjectsOnboarding?: boolean;
    hasSeenBrowseFreelancersOnboarding?: boolean;
    hasSeenPaymentsOnboarding?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    fetchUser: () => Promise<User | null>;
    fetchLoginDetails: (noArg?: never) => Promise<{
        id: string;
        username: string;
        fullName: string;
        email: string;
        role: string;
    } | null>;
    updateUser: (userData: Partial<User>) => Promise<void>;
    checkUsernameAvailability: (username: string) => Promise<boolean>;
    updateUsername: (username: string) => Promise<void>;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLoginDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/users/me`);
            const data = response.data.data;
            return {
                id: data._id || data.id || "",
                username: data.username,
                fullName: data.fullName,
                email: data.email,
                role: data.role,
            };
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch login details"
            );
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchUser = async () => {
        try {
            setLoading(true);
            setError(null);

            const loginDetails = await fetchLoginDetails();
            if (!loginDetails) {
                setError("Failed to fetch login details");
                setLoading(false);
                return null;
            }
            const { username, role, id, fullName, email } = loginDetails;

            // Admins and Interviewers don't have a profile in the same way; short-circuit to avoid profile fetch
            if (role === "admin" || role === "interviewer") {
                const adminUser: User = {
                    id: id || username,
                    username,
                    email: email || "",
                    fullName,
                    userType: role as any,
                    isVerified: true,
                    hasSeenProjectsOnboarding: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                setUser(adminUser);
                return adminUser;
            }

            const response = await api.get(`/profiles/${username}`);
            const backendData = await response.data.data;

            const User = {
                id: backendData.user._id,
                username: backendData.user.username,
                email: backendData.user.email || email || "",
                fullName: backendData.user.fullName,
                userType: backendData.user.role, // "freelancer" | "client" | "admin" | "interviewer"
                isVerified: backendData.user.isVerified ?? true,
                isPremium: backendData.user.isPremium ?? false,
                ...(backendData.user.role === "freelancer" && {
                    freelancerDetails: {
                        location: backendData.location || "",
                        workField: backendData.workField || "",
                        workExperience: backendData.workExperience || [],
                        skills: backendData.skills || [],
                        linkedIn: backendData.linkedIn || "",
                        github: backendData.github || "",
                        preferredRole: backendData.preferredRole || "",
                        bio: backendData.bio || "",
                        resume: backendData.resume || "",
                        isInterviewed: backendData.isInterviewed ?? false,
                        rating: backendData.rating || 0,
                        ratingCount: backendData.ratingCount || 0,
                        completedProjects: backendData.completedProjects || 0,
                        earnings: backendData.earnings || 0,
                    },
                }),

                ...(backendData.user.role === "client" && {
                    clientDetails: {
                        companyName: backendData.companyName || "",
                        companyDescription:
                            backendData.companyDescription || "",
                        companySize: backendData.companySize || "",
                        industry: backendData.industry || "",
                        location: backendData.location || "",
                        budgetRange: backendData.budgetRange || "",
                        preferredCommunication:
                            backendData.preferredCommunication || "",
                        projectTypes: backendData.projectTypes || [],
                        website: backendData.website || "",
                        linkedIn: backendData.linkedIn || "",
                    },
                }),
                hasSeenProjectsOnboarding: backendData.hasSeenProjectsOnboarding ?? false,
                createdAt: new Date(backendData.createdAt),
                updatedAt: new Date(backendData.updatedAt),
            };

            setUser(User);
            return User;
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch user"
            );
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (userData: Partial<User>) => {
        try {
            setError(null);

            // Update profile via API
            if (user) {
                await api.put('/profiles/me', userData);
                const updatedUser = {
                    ...user,
                    ...userData,
                    updatedAt: new Date(),
                };
                setUser(updatedUser);
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to update user"
            );
            throw err;
        }
    };

    const checkUsernameAvailability = async (username: string): Promise<boolean> => {
        try {
            const response = await api.get(`/users/username-available/${username}`);
            return response.data.available;
        } catch (err) {
            console.error('Error checking username availability:', err);
            return false;
        }
    };

    const updateUsername = async (username: string): Promise<void> => {
        try {
            await api.patch('/users/username', { username });
            if (user) {
                setUser({ ...user, username });
            }
        } catch (err) {
            throw err;
        }
    };

    const logout = async () => {
        setUser(null);
        await api
            .post(`/users/logout`, {})
            .then(() => {
                console.log("Logged out successfully!");
            })
            .catch((error: any) => {
                console.log("Cannot log out with error: ", error);
            });
    };

    const value: UserContextType = {
        user,
        loading,
        error,
        fetchUser,
        fetchLoginDetails,
        updateUser,
        checkUsernameAvailability,
        updateUsername,
        logout,
    };

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
};
