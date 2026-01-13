import { useEffect, useState } from "react";
import FreelancerApplications from "../components/dashboard/features/FreelancerApplications";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import MessagesFeature from "../components/dashboard/features/MessageFeature";
import ProfileFeature from "../components/dashboard/features/ProfileFeature";
import Projects from "../components/dashboard/features/Projects";
import DashboardHome from "../components/dashboard/features/DashboardHome";
import AnalyticsFreelancer from "../components/dashboard/features/AnalyticsFreelancer";
import EarningsFreelancer from "../components/dashboard/features/EarningsFreelancer";
// import FreelancerInterviews from "../components/dashboard/features/FreelancerInterviews";
import AccountSettings from "../components/dashboard/features/AccountSettings";
import HelpPage from "../components/dashboard/features/HelpPage";
import { useUser } from "../contexts/UserContext";
import { useInterviews } from "../contexts/InterviewContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function DashboardFreelancer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUser } = useUser();

//   const { user } = useUser();
  const { fetchPendingForFreelancer } = useInterviews();
  const [, setHasPendingRequest] = useState(false);
  const [, setHasAssignedInterview] = useState(false);
  const [, setAssignedInterview] = useState<any | null>(null);

  const [activeFeature, setActiveFeature] = useState("home");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [notificationState, setNotificationState] = useState<any>(null);

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

  // Handle notification navigation
  useEffect(() => {
    if (location.state) {
      const { section, chatId, messageId, projectId, paymentId, applicationId } = location.state;
      if (section) {
        setActiveFeature(section === "chat" ? "messages" : section);
        setNotificationState({ chatId, messageId, projectId, paymentId, applicationId });
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.state]);

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
    const completedHandler = async () => {
      // refresh when interview is completed
      await fetchUser(); // refresh user data to get updated isInterviewed flag
      check();
    };
    window.addEventListener('interviewRequestCreated', reqHandler as EventListener);
    window.addEventListener('interviewAssigned', assignedHandler as EventListener);
    window.addEventListener('interviewCompleted', completedHandler as EventListener);
    return () => { 
      mounted = false; 
      window.removeEventListener('interviewRequestCreated', reqHandler as EventListener); 
      window.removeEventListener('interviewAssigned', assignedHandler as EventListener);
      window.removeEventListener('interviewCompleted', completedHandler as EventListener);
    };
  }, []);

  const renderFeature = () => {
    switch (activeFeature) {
      case "home":
        return <DashboardHome onViewAllProjects={() => setActiveFeature("projects")} />;
      case "projects":
        return <Projects />;
      case "messages":
        return <MessagesFeature notificationState={notificationState} />;
      case "analytics":
        return <AnalyticsFreelancer />;
      case "applications":
        return <FreelancerApplications notificationState={notificationState} />;
      case "earnings":
        return <EarningsFreelancer />;
      case "freelancer-interviews":
        return (
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Interviews</h3>
              <p className="text-gray-400">Coming Soon</p>
            </div>
          </div>
        );
      case "profile":
        return <ProfileFeature />;
      case "account-settings":
        return <AccountSettings />;
      case "help":
        return <HelpPage />;
      default:
        return <DashboardHome onViewAllProjects={() => setActiveFeature("projects")} />;
    }
  };

  return (
    <div className="h-screen bg-linear-to-br from-gray-50 via-purple-50/30 to-blue-50/20">
      <div className="flex h-full lg:h-screen">
        <DashboardSidebar
          activeFeature={activeFeature}
          onFeatureSelect={setActiveFeature}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Interview status banner for freelancers */}
          {/* {user && user.userType === "freelancer" && user.freelancerDetails && user.freelancerDetails.isInterviewed === false && (
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
              )}
            </>
          )} */}
          <div className="flex-1 overflow-y-auto">{renderFeature()}</div>
        </div>
      </div>
    </div>
  );
}