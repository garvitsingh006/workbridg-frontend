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
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

export default function DashboardFreelancer() {
  const navigate = useNavigate();
  const { fetchUser } = useUser();

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
          <div className="flex-1 overflow-y-auto">{renderFeature()}</div>
        </div>
      </div>
    </div>
  );
}


