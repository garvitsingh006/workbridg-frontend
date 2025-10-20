import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserProvider } from "./contexts/UserContext";
import { ProjectProvider } from "./contexts/ProjectContext";
import { ChatProvider } from "./contexts/ChatContext";
import { InterviewProvider } from "./contexts/InterviewContext";
import { PaymentProvider } from "./contexts/PaymentContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";
import AboutPage from "./pages/AboutPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import Dashboard from "./pages/Dashboard";
import DashboardClient from "./pages/DashboardClient";
import DashboardFreelancer from "./pages/DashboardFreelancer";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardInterviewer from "./pages/DashboardInterviewer";
import SetDetailsPage from "./pages/SetDetailsPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function App() {
    return (
        <UserProvider>
            <ProjectProvider>
                <ChatProvider>
                    <InterviewProvider>
                        <PaymentProvider>
                    <Router>
                        <div className="min-h-screen flex flex-col">
                            <ToastContainer
                                position="top-right"
                                autoClose={3000}
                                hideProgressBar={false}
                                newestOnTop={false}
                                closeOnClick
                                rtl={false}
                                pauseOnFocusLoss
                                draggable
                                pauseOnHover
                            />
                            <Routes>
                                {/* Dashboard routes (without header/footer) */}
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/dashboard/client" element={<DashboardClient />} />
                                <Route path="/dashboard/freelancer" element={<DashboardFreelancer />} />
                                <Route path="/dashboard/admin" element={<DashboardAdmin />} />
                                <Route path="/dashboard/interviewer" element={<DashboardInterviewer />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/verify-email" element={<VerifyEmailPage />} />
                                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                                <Route path="/profile/:username" element={<PublicProfilePage />} />
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
                        </PaymentProvider>
                    </InterviewProvider>
                </ChatProvider>
            </ProjectProvider>
        </UserProvider>
    );
}

export default App;
