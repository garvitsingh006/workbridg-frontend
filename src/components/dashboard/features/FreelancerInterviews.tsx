import { useEffect, useMemo, useState } from "react";
import { useInterviews } from "../../../contexts/InterviewContext";
import { Video, Calendar, Clock, MapPin, Link as LinkIcon, FileText, RefreshCw, AlertCircle } from "lucide-react";

interface InterviewItem {
  _id: string;
  interviewer: { _id: string; fullName: string; email: string };
  mode: string;
  platform?: string;
  link?: string;
  timezone?: string;
  dateTime: string;
  duration: number;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Interviews</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your scheduled interview sessions</p>
        </div>
        <button
          onClick={fetchUpcoming}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium text-sm shadow-lg shadow-purple-500/30"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Interview Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-gray-600">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading interviews...</span>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming interviews</h3>
          <p className="text-gray-600 max-w-md mx-auto">Your scheduled interviews will appear here.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map(item => {
            const dt = new Date(item.dateTime);
            const isSoon = dt.toDateString() === now.toDateString();
            return (
              <div
                key={item._id}
                className={`bg-white rounded-2xl border p-6 hover:shadow-md transition-all ${
                  isSoon ? 'ring-2 ring-purple-500 border-purple-200' : 'border-gray-100'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                      {item.interviewer.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{item.interviewer.fullName}</div>
                      <div className="text-sm text-gray-500">{item.interviewer.email}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Video className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Mode</div>
                      <div className="font-medium text-gray-900">{item.mode}</div>
                    </div>
                  </div>

                  {item.platform && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <LinkIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Platform</div>
                        <div className="font-medium text-gray-900">{item.platform}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Date & Time</div>
                      <div className="font-medium text-gray-900">
                        {new Date(item.dateTime).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Duration</div>
                      <div className="font-medium text-gray-900">{item.duration} minutes</div>
                    </div>
                  </div>

                  {item.timezone && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <MapPin className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Timezone</div>
                        <div className="font-medium text-gray-900">{item.timezone}</div>
                      </div>
                    </div>
                  )}

                  {item.link && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Meeting Link</div>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-purple-600 hover:text-purple-700 underline break-all"
                      >
                        {item.link}
                      </a>
                    </div>
                  )}

                  {item.notes && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <FileText className="w-3 h-3" />
                        Notes
                      </div>
                      <div className="text-sm text-gray-700">{item.notes}</div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {isSoon && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium text-sm shadow-lg shadow-purple-500/30">
                      Join Interview
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
