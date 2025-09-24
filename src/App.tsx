import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { ProjectProvider } from "./contexts/ProjectContext";
import { ChatProvider } from "./contexts/ChatContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";
import AboutPage from "./pages/AboutPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import SetDetailsPage from "./pages/SetDetailsPage";

function App() {
    return (
        <UserProvider>
            <ProjectProvider>
                <ChatProvider>
                    <Router>
                        <div className="min-h-screen flex flex-col">
                            <Routes>
                                {/* Dashboard routes (without header/footer) */}
                                <Route
                                    path="/dashboard"
                                    element={<FreelancerDashboard />}
                                />
                                <Route path="/login" element={<LoginPage />} />
                                <Route
                                    path="/register"
                                    element={<Register />}
                                />
                                <Route
                                    path="/set-details"
                                    element={<SetDetailsPage />}
                                />
                                <Route
                                    path="/*"
                                    element={
                                        <>
                                            <Header />
                                            <main className="flex-1">
                                                <Routes>
                                                    <Route
                                                        path="/"
                                                        element={
                                                            <LandingPage />
                                                        }
                                                    />
                                                    <Route
                                                        path="/how-it-works"
                                                        element={
                                                            <HowItWorksPage />
                                                        }
                                                    />
                                                    <Route
                                                        path="/about"
                                                        element={<AboutPage />}
                                                    />
                                                </Routes>
                                            </main>
                                            <Footer />
                                        </>
                                    }
                                />
                            </Routes>
                        </div>
                    </Router>
                </ChatProvider>
            </ProjectProvider>
        </UserProvider>
    );
}

export default App;
