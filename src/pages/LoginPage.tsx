import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Users, Briefcase, ArrowRight } from "lucide-react";
import api from "../api";
import { useUser } from "../contexts/UserContext";

const LoginPage: React.FC = () => {
    const { user, fetchUser } = useUser();
    const navigate = useNavigate();
    const [userType, setUserType] = useState<"freelancer" | "client">("freelancer");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            await api.post(`/users/login`, formData);
            const freshUser = await fetchUser();

            if (!freshUser) {
                navigate("/set-details");
            } else {
                const role = freshUser.userType;
                if (role === "freelancer") navigate("/dashboard/freelancer");
                else if (role === "client") navigate("/dashboard/client");
                else if (role === "admin") navigate("/dashboard/admin");
                else navigate("/dashboard");
            }
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Floating background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-16 h-16 bg-blue-500 rounded-2xl opacity-10 animate-float"></div>
                <div className="absolute top-40 right-20 w-12 h-12 bg-purple-500 rounded-full opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-40 left-20 w-20 h-20 bg-green-500 rounded-2xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-20 right-10 w-14 h-14 bg-orange-500 rounded-full opacity-10 animate-float" style={{ animationDelay: '0.5s' }}></div>
            </div>

            <div className={`w-full max-w-md transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2 mb-8 group">
                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Briefcase className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">Workbridg</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
                    <p className="text-gray-600">Sign in to continue your journey</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 backdrop-blur-sm">
                    {/* User Type Selection */}
                    <div className="mb-8">
                        <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => setUserType("freelancer")}
                                className={`flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                                    userType === "freelancer"
                                        ? "bg-white text-gray-900 shadow-md transform scale-105"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <Users className="h-4 w-4 mr-2" />
                                Freelancer
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserType("client")}
                                className={`flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                                    userType === "client"
                                        ? "bg-white text-gray-900 shadow-md transform scale-105"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <Briefcase className="h-4 w-4 mr-2" />
                                Client
                            </button>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all duration-300 hover:border-gray-300"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all duration-300 hover:border-gray-300"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>
                            <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-black transition-colors duration-300">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-medium rounded-2xl text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Sign in as {userType}
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link to="/register" className="font-medium text-black hover:text-gray-800 transition-colors duration-300">
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;