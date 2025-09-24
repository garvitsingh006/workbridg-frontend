import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Users, Briefcase } from "lucide-react";
import axios from "axios";
import { useUser } from "../contexts/UserContext";

const LoginPage: React.FC = () => {
    const { user, fetchUser } = useUser();
    const navigate = useNavigate();
    const [userType, setUserType] = useState<"freelancer" | "client">(
        "freelancer"
    );
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await axios.post(
            `${import.meta.env.VITE_SERVER}/users/login`,
            formData,
            {
                withCredentials: true, // <-- must include this
            }
        );
        const freshUser = await fetchUser(); // Assume fetchUser returns user object or null

        if (!freshUser) {
            navigate("/set-details");
            console.log("No user found, that's why set details");
        } else {
            const role = freshUser.userType;
            if (role === "freelancer") navigate("/dashboard/freelancer");
            else if (role === "client") navigate("/dashboard/client");
            else if (role === "admin") navigate("/dashboard/admin");
            else navigate("/dashboard");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center space-x-2 mb-6"
                    >
                        <Briefcase className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-900">
                            Workbridg
                        </span>
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back
                    </h2>
                    <p className="text-gray-600">Sign in to your account</p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
                    {/* User Type Selection */}
                    <div className="mb-6">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setUserType("freelancer");
                                    console.log(userType);
                                }}
                                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-colors ${
                                    userType === "freelancer"
                                        ? "border-blue-600 bg-blue-50 text-blue-600"
                                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                                }`}
                            >
                                <Users className="h-5 w-5 mr-2" />
                                Freelancer
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setUserType("client");
                                    console.log(userType);
                                }}
                                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-colors ${
                                    userType === "client"
                                        ? "border-blue-600 bg-blue-50 text-blue-600"
                                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                                }`}
                            >
                                <Briefcase className="h-5 w-5 mr-2" />
                                Client
                            </button>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link
                                    to="/forgot-password"
                                    className="text-blue-600 hover:text-blue-500"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Sign in as {userType}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <span className="text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="text-blue-600 hover:text-blue-500 font-medium"
                            >
                                Sign up
                            </Link>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
