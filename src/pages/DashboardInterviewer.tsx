import { useEffect, useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import InterviewerAssigned from "../components/dashboard/features/InterviewerAssigned";
import MessagesFeature from "../components/dashboard/features/MessageFeature";
import AccountSettings from "../components/dashboard/features/AccountSettings";
import { Menu } from "lucide-react";

export default function DashboardInterviewer() {
  const navigate = useNavigate();
  const { fetchUser } = useUser();

  useEffect(() => {
    const func = async () => {
      const freshUser = await fetchUser();
      if (!freshUser) {
        navigate("/login");
      } else if (freshUser.userType !== "interviewer") {
        navigate("/dashboard");
      }
    };
    func();
  }, []);

  const [activeFeature, setActiveFeature] = useState("assigned-interviews");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const getFeatureTitle = () => {
    const titles: { [key: string]: string } = {
      'assigned-interviews': 'Assigned Interviews',
      messages: 'Messages',
      'account-settings': 'Account Settings',
    };
    return titles[activeFeature] || 'Dashboard';
  };

  const renderFeature = () => {
    switch (activeFeature) {
      case "assigned-interviews":
        return <InterviewerAssigned />;
      case "messages":
        return <MessagesFeature />;
      case "account-settings":
        return <AccountSettings />;
      default:
        return <InterviewerAssigned />;
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


