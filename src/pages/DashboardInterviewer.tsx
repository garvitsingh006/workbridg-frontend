import { useEffect, useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import InterviewerAssigned from "../components/dashboard/features/InterviewerAssigned";
import MessagesFeature from "../components/dashboard/features/MessageFeature";

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

  const renderFeature = () => {
    switch (activeFeature) {
      case "assigned-interviews":
        return <InterviewerAssigned />;
      case "messages":
        return <MessagesFeature />;
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
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader
            onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
            activeFeature={activeFeature}
          />
          <div className="flex-1 overflow-y-auto">{renderFeature()}</div>
        </div>
      </div>
    </div>
  );
}


