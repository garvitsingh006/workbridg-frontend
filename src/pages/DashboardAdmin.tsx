import { useEffect, useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import MessagesFeature from "../components/dashboard/features/MessageFeature";
import AdminProjectsReview from "../components/dashboard/features/AdminProjectsReview";
import AdminUsersPanel from "../components/dashboard/features/AdminUsersPanel";
import AdminApplications from "../components/dashboard/features/AdminApplications";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const { fetchUser } = useUser();

  useEffect(() => {
    const func = async () => {
      const freshUser = await fetchUser();
      if (!freshUser) {
        navigate("/login");
      } else if (freshUser.userType !== "admin") {
        navigate("/dashboard");
      }
    };
    func();
  }, []);

  const [activeFeature, setActiveFeature] = useState("projects");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderFeature = () => {
    switch (activeFeature) {
      case "projects":
        return <AdminProjectsReview />;
      case "applications":
        return <AdminApplications />;
      case "users":
        return <AdminUsersPanel />;
      case "escrow":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Escrow & Payment Management</h2>
            <p className="text-gray-600">Track funds and release/hold (placeholder).</p>
          </div>
        );
      case "agreements":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Agreement Oversight</h2>
            <p className="text-gray-600">Contracts library and approvals (placeholder).</p>
          </div>
        );
      case "disputes":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Disputes & Support</h2>
            <p className="text-gray-600">Tickets, mediation, and notes (placeholder).</p>
          </div>
        );
      case "analytics":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Analytics & Reporting</h2>
            <p className="text-gray-600">KPIs and exports (placeholder).</p>
          </div>
        );
      case "announcements":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Notifications & Announcements</h2>
            <p className="text-gray-600">System alerts to clients/freelancers (placeholder).</p>
          </div>
        );
      case "settings":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Settings & Permissions</h2>
            <p className="text-gray-600">Manage team roles, commission, terms (placeholder).</p>
          </div>
        );
      case "messages":
        return <MessagesFeature />;
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold">Admin Panel</h2>
            <p className="text-gray-600">Select a feature from the sidebar.</p>
          </div>
        );
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


