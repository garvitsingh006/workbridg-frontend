import { useEffect, useMemo, useState } from "react";
import { useInterviews } from "../../../contexts/InterviewContext";

interface InterviewItem {
  _id: string;
  freelancer?: { _id: string; fullName: string; email: string };
  mode: string;
  platform?: string;
  link?: string;
  timezone?: string;
  dateTime: string; // backend field
  duration: number; // backend field (minutes)
  notes?: string;
  status: "scheduled" | "pending" | "completed" | "cancelled";
  feedback?: { rating?: number; comments?: string };
}

export default function InterviewerAssigned() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<InterviewItem[]>([]);

  const { fetchAssignedForInterviewer, updateInterviewStatus: updateStatusApi, submitInterviewFeedback: submitFeedbackApi } = useInterviews();

  const fetchAssigned = async () => {
    try {
      setLoading(true);
      setError(null);
      const list: InterviewItem[] = await fetchAssignedForInterviewer();
      list.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      setItems(list);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, []);

  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ [id: string]: { 
    ratingDetails: { technical: number; communication: number; professionalism: number; speed: number; pastWork: number };
    rating: number; 
    comments: string 
  } }>({});
  const [confirm, setConfirm] = useState<{ id: string; action: 'completed' | 'cancelled' } | null>(null);
  const [confirmNeedsFeedback, setConfirmNeedsFeedback] = useState(false);

  const updateStatus = async (id: string, status: "completed" | "cancelled") => {
    try {
      setStatusUpdatingId(id);
      await updateStatusApi(id, status);
      await fetchAssigned();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to update status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const submitFeedback = async (id: string) => {
    const fb = feedback[id];
    if (!fb) return;
    if (fb.rating < 1 || fb.rating > 5) {
      setError("Rating must be between 1 and 5");
      return;
    }
    try {
      await submitFeedbackApi(id, { feedback: fb.comments, rating: fb.rating, ratingDetails: fb.ratingDetails });
      await fetchAssigned();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to submit feedback");
    }
  };

  const updateRatingDetail = (id: string, field: keyof typeof feedback[string]['ratingDetails'], value: number) => {
    setFeedback(prev => {
      const current = prev[id] || { ratingDetails: { technical: 0, communication: 0, professionalism: 0, speed: 0, pastWork: 0 }, rating: 0, comments: '' };
      const newRatingDetails = { ...current.ratingDetails, [field]: value };
      const avgRating = Math.round((newRatingDetails.technical + newRatingDetails.communication + newRatingDetails.professionalism + newRatingDetails.speed + newRatingDetails.pastWork) / 5);
      return { ...prev, [id]: { ...current, ratingDetails: newRatingDetails, rating: avgRating } };
    });
  };

  const now = useMemo(() => new Date(), []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Assigned Interviews</h2>
        <button className="px-4 py-2 rounded-xl bg-black text-white" onClick={fetchAssigned}>Refresh</button>
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
                <div className="font-semibold">{item.freelancer?.fullName || 'Freelancer'}</div>
                <div className="text-sm text-gray-500">{item.status}</div>
              </div>
              <div className="text-sm text-gray-600">{item.freelancer?.email || ''}</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Mode:</span> {item.mode}</div>
                {item.platform && <div><span className="text-gray-500">Platform:</span> {item.platform}</div>}
                {item.link && <div className="col-span-2"><span className="text-gray-500">Link:</span> <a className="text-blue-600 underline" href={item.link} target="_blank" rel="noreferrer">{item.link}</a></div>}
                {item.timezone && <div><span className="text-gray-500">Timezone:</span> {item.timezone}</div>}
                <div><span className="text-gray-500">Date & Time:</span> {new Date(item.dateTime).toLocaleString()}</div>
                <div><span className="text-gray-500">Duration:</span> {item.duration}m</div>
              </div>
              {item.notes && <div className="mt-2 text-sm"><span className="text-gray-500">Notes:</span> {item.notes}</div>}

              <div className="mt-4 border-t pt-3">
                <div className="font-medium mb-2">Feedback</div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="text-xs text-gray-600">Technical (1-5)</label>
                    <input type="number" min={1} max={5} className="border rounded-xl px-2 py-1 w-full" 
                      value={feedback[item._id]?.ratingDetails?.technical ?? ''}
                      onChange={e => updateRatingDetail(item._id, 'technical', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Communication (1-5)</label>
                    <input type="number" min={1} max={5} className="border rounded-xl px-2 py-1 w-full" 
                      value={feedback[item._id]?.ratingDetails?.communication ?? ''}
                      onChange={e => updateRatingDetail(item._id, 'communication', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Professionalism (1-5)</label>
                    <input type="number" min={1} max={5} className="border rounded-xl px-2 py-1 w-full" 
                      value={feedback[item._id]?.ratingDetails?.professionalism ?? ''}
                      onChange={e => updateRatingDetail(item._id, 'professionalism', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Speed (1-5)</label>
                    <input type="number" min={1} max={5} className="border rounded-xl px-2 py-1 w-full" 
                      value={feedback[item._id]?.ratingDetails?.speed ?? ''}
                      onChange={e => updateRatingDetail(item._id, 'speed', Number(e.target.value))} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-600">Past Work (1-5)</label>
                    <input type="number" min={1} max={5} className="border rounded-xl px-2 py-1 w-full" 
                      value={feedback[item._id]?.ratingDetails?.pastWork ?? ''}
                      onChange={e => updateRatingDetail(item._id, 'pastWork', Number(e.target.value))} />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="text-xs text-gray-600">Overall Rating: {feedback[item._id]?.rating || 0}/5</label>
                </div>
                <div>
                  <textarea
                    placeholder="Comments"
                    className="border rounded-xl px-3 py-2 w-full"
                    rows={2}
                    value={feedback[item._id]?.comments ?? ''}
                    onChange={e => setFeedback(prev => ({ 
                      ...prev, 
                      [item._id]: { 
                        ...(prev[item._id] || { ratingDetails: { technical: 0, communication: 0, professionalism: 0, speed: 0, pastWork: 0 }, rating: 0 }), 
                        comments: e.target.value 
                      } 
                    }))}
                  />
                </div>
                {(item.status === 'scheduled' || item.status === 'pending') && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button disabled={statusUpdatingId === item._id} onClick={() => setConfirm({ id: item._id, action: 'completed' })} className="px-3 py-1 rounded-lg bg-green-600 text-white disabled:opacity-50">Mark Completed</button>
                    <button disabled={statusUpdatingId === item._id} onClick={() => setConfirm({ id: item._id, action: 'cancelled' })} className="px-3 py-1 rounded-lg bg-red-600 text-white disabled:opacity-50">Cancel</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {items.length === 0 && !loading && (
          <div className="text-gray-500">No assigned interviews.</div>
        )}
      </div>
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="text-lg font-semibold mb-2">{confirm.action === 'completed' ? 'Confirm Completion' : 'Confirm Cancellation'}</div>
            {confirm.action === 'completed' ? (
              <div className="text-sm text-gray-600 mb-4">
                {confirmNeedsFeedback
                  ? 'Rating (1-5) and a comment are required to mark completed.'
                  : 'Please confirm marking this interview as completed.'}
              </div>
            ) : (
              <div className="text-sm text-gray-600 mb-4">Are you sure you want to cancel this interview?</div>
            )}
            <div className="flex items-center justify-end gap-2">
              {confirm.action === 'completed' && confirmNeedsFeedback ? (
                <button className="px-3 py-2 rounded-xl bg-black text-white" onClick={() => { setConfirmNeedsFeedback(false); setConfirm(null); }}>OK</button>
              ) : (
                <>
                  <button className="px-3 py-2 rounded-xl border" onClick={() => setConfirm(null)}>No</button>
                  <button
                    className="px-3 py-2 rounded-xl bg-black text-white"
                    onClick={async () => {
                      const id = confirm.id;
                      const action = confirm.action;
                      if (action === 'completed') {
                        const fb = feedback[id];
                        if (!fb || !fb.comments || !fb.rating || fb.rating < 1 || fb.rating > 5 || 
                            !fb.ratingDetails || Object.values(fb.ratingDetails).some(r => r < 1 || r > 5)) {
                          setConfirmNeedsFeedback(true);
                          return;
                        }
                        await submitFeedback(id);
                        await updateStatus(id, 'completed');
                      } else {
                        await updateStatus(id, 'cancelled');
                      }
                      setConfirm(null);
                    }}
                  >
                    Yes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


