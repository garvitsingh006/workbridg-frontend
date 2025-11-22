import { useEffect, useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import MessagesFeature from "../components/dashboard/features/MessageFeature";
import ProfileFeature from "../components/dashboard/features/ProfileFeature";
import Projects from "../components/dashboard/features/Projects";
import DashboardHome from "../components/dashboard/features/DashboardHome";
import AnalyticsFreelancer from "../components/dashboard/features/AnalyticsFreelancer";
import EarningsFreelancer from "../components/dashboard/features/EarningsFreelancer";
import FreelancerInterviews from "../components/dashboard/features/FreelancerInterviews";
import AccountSettings from "../components/dashboard/features/AccountSettings";
import { useUser } from "../contexts/UserContext";
import { useInterviews } from "../contexts/InterviewContext";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

export default function DashboardFreelancer() {
  const navigate = useNavigate();
  const { fetchUser } = useUser();

  const { user } = useUser();
  const { fetchPendingForFreelancer } = useInterviews();
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [hasAssignedInterview, setHasAssignedInterview] = useState(false);
  const [assignedInterview, setAssignedInterview] = useState<any | null>(null);

  useEffect(() => {
    const func = async () => {
      const freshUser = await fetchUser();
      if (!freshUser) {
        navigate("/login");
      } else if (freshUser.userType !== "freelancer") {
        navigate("/dashboard");
      }
    };
    func();
  }, []);

  // check if freelancer has a pending request and listen for new requests
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const list = await fetchPendingForFreelancer();
        if (!mounted) return;
        // pending request only includes requested/reschedule; assigned means scheduled
        setHasPendingRequest((list || []).some((i: any) => ['requested','reschedule_requested'].includes(i.status)));
        const scheduled = (list || []).find((i: any) => i.status === 'scheduled');
        setHasAssignedInterview(!!scheduled);
        setAssignedInterview(scheduled || null);
      } catch (e) {
        // ignore
      }
    };
    check();
    const reqHandler = () => setHasPendingRequest(true);
    const assignedHandler = () => {
      // refresh and show assigned banner
      check();
    };
    window.addEventListener('interviewRequestCreated', reqHandler as EventListener);
    window.addEventListener('interviewAssigned', assignedHandler as EventListener);
    return () => { mounted = false; window.removeEventListener('interviewRequestCreated', reqHandler as EventListener); window.removeEventListener('interviewAssigned', assignedHandler as EventListener); };
  }, []);

  const [activeFeature, setActiveFeature] = useState("home");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const getFeatureTitle = () => {
    const titles: { [key: string]: string } = {
      home: 'Dashboard',
      projects: 'Projects',
      messages: 'Messages',
      analytics: 'Analytics',
      earnings: 'Earnings',
      'freelancer-interviews': 'Interviews',
      profile: 'Profile',
      'account-settings': 'Account Settings',
    };
    return titles[activeFeature] || 'Dashboard';
  };

  const renderFeature = () => {
    switch (activeFeature) {
      case "home":
        return <DashboardHome onViewAllProjects={() => setActiveFeature("projects")} />;
      case "projects":
        return <Projects />;
      case "messages":
        return <MessagesFeature />;
      case "analytics":
        return <AnalyticsFreelancer />;
      case "earnings":
        return <EarningsFreelancer />;
      case "freelancer-interviews":
        return <FreelancerInterviews />;
      case "profile":
        return <ProfileFeature />;
      case "account-settings":
        return <AccountSettings />;
      default:
        return <DashboardHome onViewAllProjects={() => setActiveFeature("projects")} />;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/20">
      <div className="flex h-full lg:h-screen">
        <DashboardSidebar
          activeFeature={activeFeature}
          onFeatureSelect={setActiveFeature}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {getFeatureTitle()}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">July 2025</div>
            </div>
          </div>
          {/* Interview status banner for freelancers */}
          {user && user.userType === "freelancer" && user.freelancerDetails && (
            <>
              {hasAssignedInterview ? (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-800 px-6 py-3">
                  <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                      <strong className="block">Interview assigned</strong>
                      <div className="text-sm">Your interview has been scheduled. Check the Interviews page for details.</div>
                    </div>
                    <div>
                      <button onClick={() => setActiveFeature('freelancer-interviews')} className="px-3 py-2 bg-green-600 text-white rounded-md">View interview</button>
                    </div>
                  </div>
                </div>
              ) : (
                user.freelancerDetails.isInterviewed === false && (
                  <div className={`${hasPendingRequest ? 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800' : 'bg-red-50 border-l-4 border-red-500 text-red-800'} px-6 py-3`}>
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                      <div>
                        <strong className="block">{hasPendingRequest ? "Interview request pending" : "Your profile hasn't been interviewed yet."}</strong>
                        <div className="text-sm">{hasPendingRequest ? "We've received your request and the team will review it. You'll be notified when it's scheduled." : "You won't appear to clients until you complete an interview. Please schedule or complete your interview to get listed."}</div>
                      </div>
                      <div>
                        <button onClick={() => {
                          // switch to freelancer interviews view
                          setActiveFeature('freelancer-interviews');
                          if (!hasPendingRequest) {
                            try { window.dispatchEvent(new CustomEvent('openInterviewRequest')); } catch (e) {}
                          }
                        }} className={`${hasPendingRequest ? 'px-3 py-2 bg-yellow-600 text-white rounded-md' : 'px-3 py-2 bg-red-600 text-white rounded-md'}`}>{hasPendingRequest ? 'View request' : 'Schedule interview'}</button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </>
          )}
          <div className="flex-1 overflow-y-auto">{renderFeature()}</div>
        </div>
      </div>
    </div>
  );
}


