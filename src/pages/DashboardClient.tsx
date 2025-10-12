import { useEffect, useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import MessagesFeature from "../components/dashboard/features/MessageFeature";
import ProfileFeature from "../components/dashboard/features/ProfileFeature";
import Projects from "../components/dashboard/features/Projects";
import DashboardHomeClient from "../components/dashboard/features/DashboardHomeClient";
import AnalyticsClient from "../components/dashboard/features/AnalyticsClient";
import PaymentsClient from "../components/dashboard/features/PaymentsClient";
import AccountSettings from "../components/dashboard/features/AccountSettings";
import ClientApplications from "../components/dashboard/features/ClientApplications";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

export default function DashboardClient() {
  const navigate = useNavigate();
  const { fetchUser } = useUser();

  useEffect(() => {
    const func = async () => {
      const freshUser = await fetchUser();
      if (!freshUser) {
        navigate("/login");
      } else if (freshUser.userType !== "client") {
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
      projects: 'My Projects',
      messages: 'Messages',
      applications: 'Applications',
      analytics: 'Analytics',
      payments: 'Payments',
      profile: 'Profile',
      'account-settings': 'Account Settings',
    };
    return titles[activeFeature] || 'Dashboard';
  };

  const renderFeature = () => {
    switch (activeFeature) {
      case "home":
        return <DashboardHomeClient onViewAllProjects={() => setActiveFeature("projects")} />;
      case "projects":
        return <Projects />;
      case "messages":
        return <MessagesFeature />;
      case "applications":
        return <ClientApplications />;
      case "analytics":
        return <AnalyticsClient />;
      case "payments":
        return <PaymentsClient />;
      case "profile":
        return <ProfileFeature />;
      case "account-settings":
        return <AccountSettings />;
      default:
        return <DashboardHomeClient onViewAllProjects={() => setActiveFeature("projects")} />;
    }
  };

  return (
    <div className="h-screen bg-gray-50">
      <div className="flex h-full lg:h-screen">
        <DashboardSidebar
          activeFeature={activeFeature}
          onFeatureSelect={setActiveFeature}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center flex-shrink-0">
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
          </div>
          <div className="flex-1 overflow-y-auto">{renderFeature()}</div>
        </div>
      </div>
    </div>
  );
}


