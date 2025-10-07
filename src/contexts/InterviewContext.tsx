import React, { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import api from "../api";

export type InterviewStatus = "pending" | "scheduled" | "completed" | "cancelled";

export interface Interview {
  _id: string;
  freelancer?: { _id: string; fullName: string; email: string };
  interviewer?: { _id: string; fullName: string; email: string };
  mode: string;
  platform?: string;
  link?: string;
  timezone?: string;
  dateTime: string;
  duration: number;
  status: InterviewStatus;
  notes?: string;
}

interface InterviewContextType {
  // Admin
  fetchFreelancersWithoutInterview: () => Promise<any[]>;
  assignInterview: (payload: {
    freelancerId: string;
    interviewerId: string;
    mode: string;
    platform?: string;
    link?: string;
    dateTime: string;
    duration: number;
    notes?: string;
  }) => Promise<Interview>;

  // Interviewer
  fetchAssignedForInterviewer: () => Promise<Interview[]>;
  updateInterviewStatus: (id: string, status: InterviewStatus) => Promise<Interview>;
  submitInterviewFeedback: (id: string, payload: { feedback?: string; rating?: number; status?: InterviewStatus }) => Promise<Interview>;

  // Freelancer
  fetchPendingForFreelancer: () => Promise<Interview[]>;

  loading: boolean;
  error: string | null;
  setError: (e: string | null) => void;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export const useInterviews = () => {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error("useInterviews must be used within InterviewProvider");
  return ctx;
};

export const InterviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFreelancersWithoutInterview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/interviews/admin/freelancers/pending-interviews`);
      return res.data.data || [];
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to fetch freelancers");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const assignInterview = async (payload: any) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post(`/interviews/admin/interviews/assign`, payload);
      return res.data.data as Interview;
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to assign interview");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedForInterviewer = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/interviews/interviewer/assigned`);
      return (res.data.data || []) as Interview[];
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to fetch assigned interviews");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateInterviewStatus = async (id: string, status: InterviewStatus) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.patch(`/interviews/${id}/status`, { status });
      return res.data.data as Interview;
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to update interview status");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const submitInterviewFeedback = async (id: string, payload: { feedback?: string; rating?: number; status?: InterviewStatus }) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.patch(`/interviews/${id}/feedback`, payload);
      return res.data.data as Interview;
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to submit interview feedback");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingForFreelancer = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/interviews/freelancers/pending-interviews`);
      return (res.data.data || []) as Interview[];
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to fetch pending interviews");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const value: InterviewContextType = useMemo(() => ({
    fetchFreelancersWithoutInterview,
    assignInterview,
    fetchAssignedForInterviewer,
    updateInterviewStatus,
    submitInterviewFeedback,
    fetchPendingForFreelancer,
    loading,
    error,
    setError,
  }), [loading, error]);

  return (
    <InterviewContext.Provider value={value}>{children}</InterviewContext.Provider>
  );
};


