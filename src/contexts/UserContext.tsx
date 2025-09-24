import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    userType: "freelancer" | "client";
    freelancerDetails?: FreelancerDetails;
    clientDetails?: ClientDetails;
    createdAt: Date;
    updatedAt: Date;
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    fetchUser: () => Promise<User | null>;
    fetchLoginDetails: () => Promise<{
        username: string;
        fullName: string;
        email: string;
        role: string;
    } | null>;
    updateUser: (userData: Partial<User>) => Promise<void>;
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
            const response = await axios.get(
                `${import.meta.env.VITE_SERVER}/users/me`,
                { withCredentials: true }
            );
            const data = response.data.data;
            return {
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
            const { username } = loginDetails;

            const response = await axios.get(
                `${import.meta.env.VITE_SERVER}/profiles/${username}`,
                { withCredentials: true }
            );
            const backendData = await response.data.data;

            const User = {
                id: backendData.user._id,
                username: backendData.user.username,
                email: backendData.user.email || "",
                fullName: backendData.user.fullName,
                userType: backendData.user.role, // "freelancer" or "client"
                ...(backendData.user.role === "freelancer" && {
                    freelancerDetails: {
                        location: backendData.location || "",
                        workField: backendData.industry || "",
                        workExperience: [], // fill later
                        skills: [], // fill later
                        linkedIn: backendData.linkedIn || "",
                        github: "",
                        preferredRole: "",
                        bio: "",
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

            // TODO: Replace with actual API call
            // const response = await fetch('/api/user/profile', {
            //   method: 'PUT',
            //   headers: {
            //     'Content-Type': 'application/json',
            //     'Authorization': `Bearer ${localStorage.getItem('token')}`
            //   },
            //   body: JSON.stringify(userData)
            // });
            // const updatedUser = await response.json();

            // Mock update for development
            if (user) {
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

    const logout = async () => {
        setUser(null);
        await axios
            .post(
                `${import.meta.env.VITE_SERVER}/users/logout`,
                {},
                { withCredentials: true }
            )
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
        logout,
    };

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
};
