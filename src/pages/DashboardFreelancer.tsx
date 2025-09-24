import { useEffect, useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import MessagesFeature from "../components/dashboard/features/MessageFeature";
import Projects from "../components/dashboard/features/Projects";
import DashboardHome from "../components/dashboard/features/DashboardHome";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

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

  const renderFeature = () => {
    switch (activeFeature) {
      case "home":
        return <DashboardHome onViewAllProjects={() => setActiveFeature("projects")} />;
      case "projects":
        return <Projects />;
      case "messages":
        return <MessagesFeature />;
      default:
        return <DashboardHome onViewAllProjects={() => setActiveFeature("projects")} />;
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


