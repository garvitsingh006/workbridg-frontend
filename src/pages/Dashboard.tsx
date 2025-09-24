import { useEffect, useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardHome from "../components/dashboard/features/DashboardHome";
import Projects from "../components/dashboard/features/Projects";
import Feature2 from "../components/dashboard/features/Feature2";
import Feature3 from "../components/dashboard/features/Feature3";
import MessagesFeature from "../components/dashboard/features/MessageFeature";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {

    const navigate = useNavigate()
    const {fetchUser} = useUser()
    useEffect(() => {
        const func = async () => {
            const freshUser = await fetchUser(); // Assume fetchUser returns user object or null

            if (!freshUser) {
                navigate("/login");
                console.log("No user found, that's why login");
            } else {
                const role = freshUser.userType;
                if (role === 'freelancer') navigate('/dashboard/freelancer');
                else if (role === 'client') navigate('/dashboard/client');
                else if (role === 'admin') navigate('/dashboard/admin');
            }
        }
        func()
    }, [])

    const [activeFeature, setActiveFeature] = useState("home");
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    

    const renderFeature = () => {
        switch (activeFeature) {
            case "home":
                return <DashboardHome onViewAllProjects={() => setActiveFeature("projects")}  />;
            case "projects":
                return <Projects />;
            case "messages":
                return <MessagesFeature />;
            case "earnings":
                return <Feature2 />;
            case "analytics":
                return <Feature3 />;
            case "calendar":
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold">Calendar Feature</h2>
                        <p className="text-gray-600">Coming soon...</p>
                    </div>
                );
            case "notifications":
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold">
                            Notifications Feature
                        </h2>
                        <p className="text-gray-600">Coming soon...</p>
                    </div>
                );
            case "profile":
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold">Profile Feature</h2>
                        <p className="text-gray-600">Coming soon...</p>
                    </div>
                );
            case "settings":
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold">Settings Feature</h2>
                        <p className="text-gray-600">Coming soon...</p>
                    </div>
                );
            default:
                return <DashboardHome onViewAllProjects={() => setActiveFeature("projects")} />;
        }
    };

    return (
        <div className="h-screen bg-gray-50">
            <div className="flex h-full lg:h-screen">
                {/* Dashboard Sidebar */}
                <DashboardSidebar
                    activeFeature={activeFeature}
                    onFeatureSelect={setActiveFeature}
                    isMobileOpen={isMobileSidebarOpen}
                    onCloseMobile={() => setIsMobileSidebarOpen(false)}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Dashboard Header */}
                    <DashboardHeader
                        onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
                        activeFeature={activeFeature}
                    />

                    {/* Feature Content */}
                    <div className="flex-1 overflow-y-auto">
                        {renderFeature()}
                    </div>
                </div>
            </div>
        </div>
    );
}
