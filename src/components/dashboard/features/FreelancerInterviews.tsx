import { useEffect, useMemo, useState } from "react";
import { useInterviews } from "../../../contexts/InterviewContext";
import {
    Video,
    Calendar,
    Clock,
    MapPin,
    Link as LinkIcon,
    FileText,
    RefreshCw,
    AlertCircle,
} from "lucide-react";

interface InterviewItem {
    _id: string;
    interviewer?: { _id: string; fullName: string; email: string } | null;
    mode: string;
    platform?: string;
    link?: string;
    timezone?: string;
    dateTime: string;
    duration: number;
    notes?: string;
    status:
        | "scheduled"
        | "requested"
        | "reschedule_requested"
        | "pending"
        | "completed"
        | "cancelled";
}

export default function FreelancerInterviews() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<InterviewItem[]>([]);

    const { fetchPendingForFreelancer } = useInterviews();
    const { fetchAvailableSlots, createInterviewRequest } = useInterviews();

    const fetchUpcoming = async () => {
        try {
            setLoading(true);
            setError(null);
            const listRaw = await fetchPendingForFreelancer();
            // include requested / reschedule_requested / scheduled so freelancer can see their request
            let list: InterviewItem[] = (listRaw || []).map((i: any) => ({
                ...i,
                interviewer: i.interviewer || {
                    _id: "",
                    fullName: "TBD",
                    email: "",
                },
            }));

            // If a scheduled interview exists, show only scheduled interview(s) and hide any requests
            const hasScheduled = list.some((x) => x.status === "scheduled");
            if (hasScheduled) {
                list = list.filter((x) => x.status === "scheduled");
            }

            list.sort(
                (a, b) =>
                    new Date(a.dateTime).getTime() -
                    new Date(b.dateTime).getTime()
            );
            setItems(list);
        } catch (e: any) {
            setError(
                e?.response?.data?.message ||
                    e.message ||
                    "Failed to load interviews"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUpcoming();
    }, []);

    // Listen for global request-open event (dispatched by header/banner)
    useEffect(() => {
        const handler = () => {
            openRequestModal();
        };
        window.addEventListener(
            "openInterviewRequest",
            handler as EventListener
        );
        const assignedHandler = () => {
            // refresh upcoming when assignment happens
            fetchUpcoming();
        };
        window.addEventListener(
            "interviewAssigned",
            assignedHandler as EventListener
        );
        return () => {
            window.removeEventListener(
                "openInterviewRequest",
                handler as EventListener
            );
            window.removeEventListener(
                "interviewAssigned",
                assignedHandler as EventListener
            );
        };
    }, []);

    // Request modal state
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [slots, setSlots] = useState<
        Array<{ dateTime: string; duration: number; available: boolean }>
    >([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [preferredRole, setPreferredRole] = useState<string>("");

    const openRequestModal = async () => {
        // prevent opening request modal if a scheduled interview already exists
        const hasScheduled = items.some((i) => i.status === "scheduled");
        if (hasScheduled) {
            return;
        }
        setShowRequestModal(true);
        try {
            const s = await fetchAvailableSlots({
                days: 14,
                includeWeekend: false,
            });
            // normalize date strings
            setSlots(
                (s || []).map((x: any) => ({
                    ...x,
                    dateTime: new Date(x.dateTime).toISOString(),
                }))
            );
        } catch (e) {
            // error handled in context
        }
    };

    const submitRequest = async () => {
        if (!selectedSlot) return alert("Please select a slot");
        try {
            await createInterviewRequest({
                dateTime: selectedSlot,
                preferredRole,
            });
            alert(
                "Interview request submitted. Admin will review and schedule."
            );
            setShowRequestModal(false);
            // notify other parts of the app that a request was created
            try {
                window.dispatchEvent(
                    new CustomEvent("interviewRequestCreated")
                );
            } catch (e) {}
            fetchUpcoming();
        } catch (e: any) {
            alert(
                e?.response?.data?.message ||
                    e?.message ||
                    "Failed to request slot"
            );
        }
    };

    const now = useMemo(() => new Date(), []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "scheduled":
                return "bg-blue-100 text-blue-800";
            case "completed":
                return "bg-green-100 text-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Upcoming Interviews
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage your scheduled interview sessions
                    </p>
                </div>
                <button
                    onClick={fetchUpcoming}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium text-sm shadow-lg shadow-purple-500/30"
                >
                    <RefreshCw
                        className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div className="text-sm text-red-700">{error}</div>
                </div>
            )}

            {/* Interviews List + Request Card */}
            <div className="grid grid-cols-1 gap-4">
                {items.map((item) => {
                    const dt = new Date(item.dateTime);
                    const isSoon = dt.toDateString() === now.toDateString();
                    return (
                        <div
                            key={item._id}
                            className={`bg-white rounded-2xl border p-6 hover:shadow-md transition-all ${
                                isSoon
                                    ? "ring-2 ring-purple-500 border-purple-200"
                                    : "border-gray-100"
                            }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                                        {String(
                                            item.interviewer?.fullName || "T"
                                        ).charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">
                                            {item.interviewer?.fullName ||
                                                "TBD"}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {item.interviewer?.email || ""}
                                        </div>
                                    </div>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                                >
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
                                        <div className="text-xs text-gray-500">
                                            Mode
                                        </div>
                                        <div className="font-medium text-gray-900">
                                            {item.mode}
                                        </div>
                                    </div>
                                </div>

                                {item.platform && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <LinkIcon className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">
                                                Platform
                                            </div>
                                            <div className="font-medium text-gray-900">
                                                {item.platform}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Calendar className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">
                                            Date & Time
                                        </div>
                                        <div className="font-medium text-gray-900">
                                            {new Date(
                                                item.dateTime
                                            ).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <Clock className="w-4 h-4 text-yellow-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">
                                            Duration
                                        </div>
                                        <div className="font-medium text-gray-900">
                                            {item.duration} minutes
                                        </div>
                                    </div>
                                </div>

                                {item.timezone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <MapPin className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">
                                                Timezone
                                            </div>
                                            <div className="font-medium text-gray-900">
                                                {item.timezone}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {item.link && (
                                    <div className="pt-2 border-t border-gray-100">
                                        <div className="text-xs text-gray-500 mb-1">
                                            Meeting Link
                                        </div>
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
                                        <div className="text-sm text-gray-700">
                                            {item.notes}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Button(s) depending on status */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                {item.status === "scheduled" && isSoon && (
                                    <button className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium text-sm shadow-lg shadow-purple-500/30">
                                        Join Interview
                                    </button>
                                )}

                                {item.status === "requested" && (
                                    <div className="text-sm text-gray-700">
                                        Your interview request for{" "}
                                        <strong>
                                            {new Date(
                                                item.dateTime
                                            ).toLocaleString()}
                                        </strong>{" "}
                                        is pending review by the team.
                                    </div>
                                )}

                                {item.status === "reschedule_requested" && (
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm text-gray-700">
                                            The team requested a reschedule for
                                            your selected time.
                                        </div>
                                        <button
                                            onClick={openRequestModal}
                                            className="ml-auto px-3 py-1 bg-purple-600 text-white rounded"
                                        >
                                            Choose new slot
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Request Interview Card */}
                {/* Request Interview Card — ONLY if no scheduled interview exists */}
                {!items.some((i) => i.status === "scheduled") && (
                    <div className="bg-white rounded-2xl border p-6 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Request an Interview
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Choose an available slot and submit a
                                    request. Admin will review and schedule.
                                </p>
                            </div>
                            <button
                                onClick={openRequestModal}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                            >
                                Request Slot
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white rounded-2xl w-full max-w-3xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">
                                Request Interview Slot
                            </h3>
                            <button
                                onClick={() => setShowRequestModal(false)}
                                className="text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm text-gray-600 mb-2">
                                    Preferred Role (optional)
                                </label>
                                <input
                                    value={preferredRole}
                                    onChange={(e) =>
                                        setPreferredRole(e.target.value)
                                    }
                                    placeholder="e.g., Frontend Developer"
                                    className="w-full border rounded-xl px-3 py-2"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm text-gray-600 mb-2">
                                    Available Slots (next 14 days)
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-auto">
                                    {slots.map((s) => {
                                        const dt = new Date(s.dateTime);
                                        const label = dt.toLocaleString();
                                        return (
                                            <button
                                                key={s.dateTime}
                                                type="button"
                                                disabled={!s.available}
                                                onClick={() =>
                                                    setSelectedSlot(s.dateTime)
                                                }
                                                className={`text-left p-3 rounded-lg border ${selectedSlot === s.dateTime ? "border-purple-600 bg-purple-50" : "border-gray-100"} ${s.available ? "" : "opacity-50 cursor-not-allowed"}`}
                                            >
                                                <div className="font-medium">
                                                    {label}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {s.duration} minutes{" "}
                                                    {s.available
                                                        ? ""
                                                        : "(unavailable)"}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-2">
                            <button
                                onClick={() => setShowRequestModal(false)}
                                className="px-4 py-2 rounded-xl border"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={!selectedSlot}
                                onClick={submitRequest}
                                className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
