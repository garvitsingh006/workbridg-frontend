import { useEffect, useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import MessagesFeature from "../components/dashboard/features/MessageFeature";
import AdminProjectsReview from "../components/dashboard/features/AdminProjectsReview";
import AdminUsersPanel from "../components/dashboard/features/AdminUsersPanel";
import AdminApplications from "../components/dashboard/features/AdminApplications";
import AdminInterviewManagement from "../components/dashboard/features/AdminInterviewManagement";
import AccountSettings from "../components/dashboard/features/AccountSettings";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

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

  const getFeatureTitle = () => {
    const titles: { [key: string]: string } = {
      home: 'Dashboard',
      projects: 'Project Review',
      messages: 'Messages',
      applications: 'Applications',
      users: 'User Profiles',
      escrow: 'Escrow & Payment Management',
      interviews: 'Interview Management',
      analytics: 'Analytics & Reporting',
      'account-settings': 'Account Settings',
    };
    return titles[activeFeature] || 'Dashboard';
  };

  const renderFeature = () => {
    switch (activeFeature) {
      case "projects":
        return <AdminProjectsReview />;
      case "applications":
        return <AdminApplications />;
      case "users":
        return <AdminUsersPanel />;
      case "interviews":
        return <AdminInterviewManagement />;
      case "account-settings":
        return <AccountSettings />;
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


