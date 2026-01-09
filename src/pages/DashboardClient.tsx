import { useEffect, useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import MessagesFeature from "../components/dashboard/features/MessageFeature";
import ProfileFeature from "../components/dashboard/features/ProfileFeature";
import Projects from "../components/dashboard/features/Projects";
import DashboardHomeClient from "../components/dashboard/features/DashboardHomeClient";
import PaymentsClient from "../components/dashboard/features/PaymentsClient";
import AccountSettings from "../components/dashboard/features/AccountSettings";
import HelpPage from "../components/dashboard/features/HelpPage";
import ClientApplications from "../components/dashboard/features/ClientApplications";
import BrowseFreelancers from "../components/dashboard/features/BrowseFreelancers";
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
      case "browse-freelancers":
        return <BrowseFreelancers />;
      case "home":
        return <DashboardHomeClient onViewAllProjects={() => setActiveFeature("projects")} />;
      case "projects":
        return <Projects />;
      case "messages":
        return <MessagesFeature />;
      case "applications":
        return <ClientApplications />;
      case "payments":
        return <PaymentsClient />;
      case "profile":
        return <ProfileFeature />;
      case "account-settings":
        return <AccountSettings />;
      case "help":
        return <HelpPage />;
      default:
        return <DashboardHomeClient onViewAllProjects={() => setActiveFeature("projects")} />;
    }
  };

  return (
    <div className="h-screen bg-gray-50">
      <div className="flex h-full">
        <DashboardSidebar
          activeFeature={activeFeature}
          onFeatureSelect={setActiveFeature}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto">{renderFeature()}</div>
        </div>
      </div>
    </div>
  );
}


