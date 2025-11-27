import { useEffect, useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHome from "../components/dashboard/features/DashboardHome";
import Projects from "../components/dashboard/features/Projects";
import Feature2 from "../components/dashboard/features/Feature2";
import Feature3 from "../components/dashboard/features/Feature3";
import MessagesFeature from "../components/dashboard/features/MessageFeature";
import AccountSettings from "../components/dashboard/features/AccountSettings";
import HelpPage from "../components/dashboard/features/HelpPage";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

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
                else if (role === 'interviewer') navigate('/dashboard/interviewer');
            }
        }
        func()
    }, [])

    const [activeFeature, setActiveFeature] = useState("home");
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        const handler = () => setActiveFeature('messages');
        window.addEventListener('open-messages-feature', handler as any);
        return () => window.removeEventListener('open-messages-feature', handler as any);
    }, []);

    const getFeatureTitle = () => {
        const titles: { [key: string]: string } = {
            home: 'Dashboard',
            projects: 'Projects',
            messages: 'Messages',
            earnings: 'Earnings',
            analytics: 'Analytics',
            calendar: 'Calendar',
            notifications: 'Notifications',
            profile: 'Profile',
            settings: 'Settings',
            'account-settings': 'Account Settings',
            'help': 'Help & Support',
        };
        return titles[activeFeature] || 'Dashboard';
    };

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
            case "account-settings":
                return <AccountSettings />;
            case "help":
                return <HelpPage />;
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
                    <div className="flex-1 overflow-y-auto">
                        {renderFeature()}
                    </div>
                </div>
            </div>
        </div>
    );
}
