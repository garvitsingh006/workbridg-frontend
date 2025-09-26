import { useEffect, useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import MessagesFeature from "../components/dashboard/features/MessageFeature";
import ProfileFeature from "../components/dashboard/features/ProfileFeature";
import Projects from "../components/dashboard/features/Projects";
import DashboardHomeClient from "../components/dashboard/features/DashboardHomeClient";
import AnalyticsClient from "../components/dashboard/features/AnalyticsClient";
import PaymentsClient from "../components/dashboard/features/PaymentsClient";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

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

  const renderFeature = () => {
    switch (activeFeature) {
      case "home":
        return <DashboardHomeClient onViewAllProjects={() => setActiveFeature("projects")} />;
      case "projects":
        return <Projects />;
      case "messages":
        return <MessagesFeature />;
      case "analytics":
        return <AnalyticsClient />;
      case "payments":
        return <PaymentsClient />;
      case "profile":
        return <ProfileFeature />;
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


