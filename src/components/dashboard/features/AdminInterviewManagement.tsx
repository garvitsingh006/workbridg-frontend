import { useEffect, useMemo, useState } from "react";
import { useInterviews } from "../../../contexts/InterviewContext";
import api from "../../../api";

interface FreelancerLite {
  _id: string;
  fullName: string;
  email: string;
  skills: string[];
  experience?: string;
  createdAt: string;
  latestInterview?: {
    status: "scheduled" | "pending" | "completed" | "cancelled";
  };
}

interface InterviewerLite {
  _id: string;
  fullName: string;
  email: string;
}

interface AssignFormState {
  freelancerId: string;
  interviewerId: string;
  mode: "online" | "offline";
  platform?: string;
  link?: string;
  timezone?: string;
  datetimeLocal: string; // from input datetime-local
  durationMinutes: number;
  notes?: string;
}

export default function AdminInterviewManagement() {
  const { fetchFreelancersWithoutInterview, assignInterview, error, setError } = useInterviews();
  const [loading, setLoading] = useState(false);
  const [freelancers, setFreelancers] = useState<FreelancerLite[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "scheduled" | "completed" | "cancelled">("all");
  const [interviewers, setInterviewers] = useState<InterviewerLite[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerLite | null>(null);

  const [form, setForm] = useState<AssignFormState>({
    freelancerId: "",
    interviewerId: "",
    mode: "online",
    platform: "Google Meet",
    link: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    datetimeLocal: "",
    durationMinutes: 30,
    notes: "",
  });

  const isValid = useMemo(() => {
    if (!form.freelancerId || !form.interviewerId) return false;
    if (!form.datetimeLocal) return false;
    if (form.durationMinutes < 5) return false;
    if (form.mode === "online" && (!form.platform || !form.link)) return false;
    return true;
  }, [form]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [freelancersList, interviewersList] = await Promise.all([
        fetchFreelancersWithoutInterview(),
        api.get(`/users/getInterviewers`).then((r: any) => r.data?.data?.users || r.data?.users || []),
      ]);
      setFreelancers(freelancersList || []);
      setInterviewers(interviewersList || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAssign = (f: FreelancerLite) => {
    setSelectedFreelancer(f);
    setForm(prev => ({ ...prev, freelancerId: f._id }));
    setShowModal(true);
  };

  const handleAssign = async () => {
    if (!isValid) return;
    try {
      setLoading(true);
      const payload = {
        freelancerId: form.freelancerId,
        interviewerId: form.interviewerId,
        mode: form.mode,
        platform: form.platform,
        link: form.link,
        dateTime: new Date(form.datetimeLocal).toISOString(),
        duration: form.durationMinutes,
        notes: form.notes,
      };
      await assignInterview(payload);
      setShowModal(false);
      setForm(prev => ({ ...prev, interviewerId: "", datetimeLocal: "", link: "", notes: "" }));
      await fetchData();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to assign interview");
      // Auto-close modal on backend errors as requested
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Interview Management</h2>
        <button
          onClick={fetchData}
          className="px-4 py-2 rounded-xl bg-black text-white"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <label className="text-sm text-gray-600">Filter by status</label>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="border rounded-xl px-3 py-2"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-200">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Full Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Skills</th>
              <th className="text-left p-3">Experience</th>
              <th className="text-left p-3">Registration</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {freelancers.length === 0 && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={7}>No pending freelancers.</td>
              </tr>
            )}
            {freelancers
              .filter((f: any) => {
                if (statusFilter === 'all') return true;
                const s = f.latestInterview?.status || 'pending';
                return s === statusFilter;
              })
              .map((f: any) => (
              <tr key={f._id} className="border-t border-gray-100">
                <td className="p-3 font-medium">{f.fullName}</td>
                <td className="p-3">{f.email}</td>
                <td className="p-3">{(f.skills || []).join(", ")}</td>
                <td className="p-3">{f.experience || "-"}</td>
                <td className="p-3">{new Date(f.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  {f.latestInterview?.status ? (
                    <span className="px-2 py-1 rounded-full text-xs border">
                      {f.latestInterview.status}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">pending</span>
                  )}
                </td>
                <td className="p-3">
                  {f.latestInterview?.status === 'cancelled' && (
                    <button onClick={() => openAssign(f)} className="px-3 py-1 rounded-lg bg-indigo-600 text-white">Reassign</button>
                  )}
                  {!f.latestInterview?.status && (
                    <button onClick={() => openAssign(f)} className="px-3 py-1 rounded-lg bg-black text-white">Assign</button>
                  )}
                  {f.latestInterview?.status === 'pending' && (
                    <button onClick={() => openAssign(f)} className="px-3 py-1 rounded-lg bg-black text-white">Assign</button>
                  )}
                  {f.latestInterview?.status === 'scheduled' && (
                    <span className="text-xs text-gray-500">Already scheduled</span>
                  )}
                  {f.latestInterview?.status === 'completed' && (
                    <span className="text-xs text-gray-500">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Assign Interview</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-600">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Freelancer</label>
                <input disabled value={selectedFreelancer?.fullName || ""} className="w-full border rounded-xl px-3 py-2 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Interviewer</label>
                <select
                  className="w-full border rounded-xl px-3 py-2"
                  value={form.interviewerId}
                  onChange={e => setForm(prev => ({ ...prev, interviewerId: e.target.value }))}
                >
                  <option value="">Select interviewer</option>
                  {interviewers.map(i => (
                    <option key={i._id} value={i._id}>{i.fullName} - {i.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Mode</label>
                <select
                  className="w-full border rounded-xl px-3 py-2"
                  value={form.mode}
                  onChange={e => setForm(prev => ({ ...prev, mode: e.target.value as any }))}
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              {form.mode === "online" && (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Platform</label>
                    <input className="w-full border rounded-xl px-3 py-2" value={form.platform || ""} onChange={e => setForm(prev => ({ ...prev, platform: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Link</label>
                    <input className="w-full border rounded-xl px-3 py-2" value={form.link || ""} onChange={e => setForm(prev => ({ ...prev, link: e.target.value }))} />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Timezone</label>
                <input className="w-full border rounded-xl px-3 py-2" value={form.timezone || ""} onChange={e => setForm(prev => ({ ...prev, timezone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date & Time</label>
                <input type="datetime-local" className="w-full border rounded-xl px-3 py-2" value={form.datetimeLocal} onChange={e => setForm(prev => ({ ...prev, datetimeLocal: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Duration (minutes)</label>
                <input type="number" min={5} className="w-full border rounded-xl px-3 py-2" value={form.durationMinutes} onChange={e => setForm(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Notes</label>
                <textarea className="w-full border rounded-xl px-3 py-2" rows={3} value={form.notes || ""} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border">Cancel</button>
              <button disabled={!isValid || loading} onClick={handleAssign} className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50">Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


