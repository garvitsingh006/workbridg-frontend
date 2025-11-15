import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Briefcase, ArrowRight, Sparkles, Zap, Heart, Star } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import api from "../api";
import { useUser } from "../contexts/UserContext";

const LoginPage: React.FC = () => {
    const { fetchUser, fetchLoginDetails } = useUser();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // Refs to track component state
    const isMounted = useRef(true);
    const hasCheckedAuth = useRef(false);
    const authCheckInProgress = useRef(false);
    const authCheckTimeout = useRef<NodeJS.Timeout | null>(null);

    // Clear any pending timeouts on unmount
    useEffect(() => {
        return () => {
            if (authCheckTimeout.current) {
                clearTimeout(authCheckTimeout.current);
            }
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (!isMounted.current) return;
        
        setIsVisible(true);
        
        // Only run auth check if we haven't already done so
        if (hasCheckedAuth.current || authCheckInProgress.current) return;

        const checkAuthStatus = async () => {
            if (!isMounted.current || authCheckInProgress.current) return;
            
            authCheckInProgress.current = true;
            
            try {
                // First, check if we have a token to avoid unnecessary requests
                const token = localStorage.getItem('token');
                if (!token) {
                    hasCheckedAuth.current = true;
                    return;
                }

                // Add a small delay to prevent rapid-fire requests during initial render
                await new Promise(resolve => {
                    authCheckTimeout.current = setTimeout(resolve, 100);
                });

                if (!isMounted.current) return;
                
                const loginDetails = await fetchLoginDetails();
                
                if (!isMounted.current) return;
                
                if (loginDetails) {
                    const fullUser = await fetchUser();
                    
                    if (!isMounted.current) return;
                    
                    if (fullUser?.userType) {
                        const role = fullUser.userType;
                        navigate(`/dashboard/${role}`, { replace: true });
                        return;
                    } else if (fullUser) {
                        navigate("/set-details", { replace: true });
                        return;
                    }
                }
            } catch (error) {
                // Clear any invalid tokens on error
                localStorage.removeItem('token');
                console.error("Auth check failed:", error);
            } finally {
                if (isMounted.current) {
                    hasCheckedAuth.current = true;
                    authCheckInProgress.current = false;
                }
            }
        };
        
        checkAuthStatus();
        
        return () => {
            if (authCheckTimeout.current) {
                clearTimeout(authCheckTimeout.current);
            }
        };
    }, [navigate, fetchLoginDetails, fetchUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post(`/users/login`, formData);
            const freshUser = await fetchUser();

            if (freshUser && freshUser.isVerified === false) {
                toast.error("Please verify your email before logging in. Check your inbox for the verification link.");
                navigate("/verify-email", { state: { email: formData.email } });
                return;
            }

            if (!freshUser) {
                navigate("/set-details");
            } else {
                const role = freshUser.userType;
                if (role === "freelancer") navigate("/dashboard/freelancer");
                else if (role === "client") navigate("/dashboard/client");
                else if (role === "admin") navigate("/dashboard/admin");
                else navigate("/dashboard");
            }
        } catch (error: any) {
            console.error("Login failed:", error);

            if (error.response?.status === 403 || error.response?.data?.message?.includes("verify") || error.response?.data?.message?.includes("verification")) {
                toast.error("Please verify your email before logging in. Check your inbox for the verification link.");
                if (error.response?.data?.email) {
                    navigate("/verify-email", { state: { email: error.response.data.email } });
                }
            } else {
                toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
            }
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

    const floatingElements = [
        { icon: Sparkles, color: 'bg-blue-500', delay: '0s', size: 'w-12 h-12' },
        { icon: Zap, color: 'bg-purple-500', delay: '1s', size: 'w-10 h-10' },
        { icon: Heart, color: 'bg-pink-500', delay: '2s', size: 'w-14 h-14' },
        { icon: Star, color: 'bg-yellow-500', delay: '0.5s', size: 'w-8 h-8' },
        { icon: Briefcase, color: 'bg-green-500', delay: '1.5s', size: 'w-16 h-16' },
    ];

    return (
        <div className="min-h-screen bg-white flex relative overflow-hidden">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
                {/* Floating Elements */}
                {floatingElements.map((element, index) => (
                    <div
                        key={index}
                        className={`absolute ${element.size} ${element.color} rounded-3xl flex items-center justify-center text-white shadow-2xl animate-float opacity-20`}
                        style={{
                            left: `${10 + (index * 15) % 70}%`,
                            top: `${15 + (index * 20) % 70}%`,
                            animationDelay: element.delay,
                            animationDuration: `${4 + (index % 3)}s`
                        }}
                    >
                        <element.icon className="w-1/2 h-1/2" />
                    </div>
                ))}

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-12 text-white">
                    <div className="mb-8">
                        <h1 className="text-5xl font-bold mb-6 leading-tight">
                            Never run out of
                            <br />
                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                talent again.
                            </span>
                        </h1>
                        <p className="text-xl text-gray-300 leading-relaxed">
                            Join thousands of professionals who trust Workbridg for dispute-free freelance collaboration.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 mb-12">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-2">5,000+</div>
                            <div className="text-sm text-gray-400">Active professionals</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-2">98%</div>
                            <div className="text-sm text-gray-400">Success rate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-2">4.9/5</div>
                            <div className="text-sm text-gray-400">Average rating</div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">✓</span>
                            </div>
                            <span className="text-gray-300">Dispute-free collaboration</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">✓</span>
                            </div>
                            <span className="text-gray-300">Admin-mediated process</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">✓</span>
                            </div>
                            <span className="text-gray-300">Secure payments</span>
                        </div>
                    </div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                <div className={`w-full max-w-md transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {/* Logo and Header */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center space-x-2 mb-8 group">
                            <div className="w-12 h-12 bg-black rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <Briefcase className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">Workbridg</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
                        <p className="text-gray-600">Sign in to continue your journey</p>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 backdrop-blur-sm">
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
                                className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-medium rounded-2xl text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">or</span>
                                </div>
                            </div>

                            <div className="mt-6 w-full">
                                <GoogleLogin
                                    onSuccess={async (credentialResponse) => {
                                        try {
                                            const res = await api.post("/users/auth/google/login", {
                                                token: credentialResponse.credential,
                                            });

                                            const { isNewUser } = res.data.data;

                                            if (isNewUser) {
                                                toast.error("User not registered. Please sign up first.");
                                                return;
                                            }

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
                                        } catch (error: any) {
                                            console.error("Google login failed:", error);
                                            toast.error(error.response?.data?.message || "Google login failed");
                                        }
                                    }}
                                    onError={() => {
                                        toast.error("Google login failed");
                                    }}
                                    text="continue_with"
                                    shape="rectangular"
                                    size="large"
                                    width="100%"
                                />
                            </div>
                        </div>

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
        </div>
    );
};

export default LoginPage;