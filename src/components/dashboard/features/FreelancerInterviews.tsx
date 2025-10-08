import { useEffect, useMemo, useState } from "react";
import { useInterviews } from "../../../contexts/InterviewContext";

interface InterviewItem {
  _id: string;
  interviewer: { _id: string; fullName: string; email: string };
  mode: string;
  platform?: string;
  link?: string;
  timezone?: string;
  dateTime: string; // backend field
  duration: number; // backend field (minutes)
  notes?: string;
  status: "scheduled" | "pending" | "completed" | "cancelled";
}

export default function FreelancerInterviews() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<InterviewItem[]>([]);

  const { fetchPendingForFreelancer } = useInterviews();

  const fetchUpcoming = async () => {
    try {
      setLoading(true);
      setError(null);
      const listRaw = await fetchPendingForFreelancer();
      const list: InterviewItem[] = (listRaw || [])
        .filter((i: any) => i.status === 'scheduled' && i.interviewer)
        .map((i: any) => ({
          ...i,
          interviewer: i.interviewer || { _id: '', fullName: 'Unknown', email: '' }
        }));
      list.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      setItems(list);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const now = useMemo(() => new Date(), []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Upcoming Interviews</h2>
        <button className="px-4 py-2 rounded-xl bg-black text-white" onClick={fetchUpcoming}>Refresh</button>
      </div>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {items.map(item => {
          const dt = new Date(item.dateTime);
          const isSoon = dt.toDateString() === now.toDateString();
          return (
            <div key={item._id} className={`border rounded-2xl bg-white p-4 ${isSoon ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="font-semibold">{item.interviewer.fullName}</div>
                <div className="text-sm text-gray-500">{item.status}</div>
              </div>
              <div className="text-sm text-gray-600">{item.interviewer.email}</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Mode:</span> {item.mode}</div>
                {item.platform && <div><span className="text-gray-500">Platform:</span> {item.platform}</div>}
                {item.link && <div className="col-span-2"><span className="text-gray-500">Link:</span> <a className="text-blue-600 underline" href={item.link} target="_blank" rel="noreferrer">{item.link}</a></div>}
                {item.timezone && <div><span className="text-gray-500">Timezone:</span> {item.timezone}</div>}
                <div><span className="text-gray-500">Date & Time:</span> {new Date(item.dateTime).toLocaleString()}</div>
                <div><span className="text-gray-500">Duration:</span> {item.duration}m</div>
              </div>
              {item.notes && <div className="mt-2 text-sm"><span className="text-gray-500">Notes:</span> {item.notes}</div>}
            </div>
          );
        })}
        {items.length === 0 && !loading && (
          <div className="text-gray-500">No upcoming interviews.</div>
        )}
      </div>
    </div>
  );
}


