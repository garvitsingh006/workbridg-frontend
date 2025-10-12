import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Briefcase, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api";

const ResetPasswordPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        setIsVisible(true);
        if (!token) {
            setTokenValid(false);
            toast.error("Invalid reset link");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        setIsLoading(true);

        try {
            await api.post(`/users/reset-password/${token}`, {
                newPassword: formData.password,
            });
            setResetSuccess(true);
            toast.success("Password reset successfully!");

            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (error: any) {
            console.error("Password reset failed:", error);
            const errorMsg = error.response?.data?.message || "Password reset failed. The link may be expired or invalid.";
            toast.error(errorMsg);

            if (errorMsg.includes("expired") || errorMsg.includes("invalid")) {
                setTokenValid(false);
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

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, text: "", color: "" };
        if (password.length < 6) return { strength: 1, text: "Weak", color: "bg-red-500" };
        if (password.length < 10) return { strength: 2, text: "Fair", color: "bg-yellow-500" };
        if (password.length < 14) return { strength: 3, text: "Good", color: "bg-blue-500" };
        return { strength: 4, text: "Strong", color: "bg-green-500" };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                <div className={`w-full max-w-md transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center space-x-2 mb-8 group">
                            <div className="w-12 h-12 bg-black rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <Briefcase className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">Workbridg</span>
                        </Link>
                    </div>

                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-red-600" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Invalid reset link</h1>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            This password reset link is invalid or has expired. Please request a new one.
                        </p>

                        <Link
                            to="/forgot-password"
                            className="inline-flex items-center justify-center w-full py-4 px-6 border border-transparent text-sm font-medium rounded-2xl text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 transform hover:scale-105 shadow-lg mb-4"
                        >
                            Request new link
                        </Link>

                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center w-full py-4 px-6 border border-gray-300 text-sm font-medium rounded-2xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 shadow-sm"
                        >
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (resetSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                <div className={`w-full max-w-md transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center space-x-2 mb-8 group">
                            <div className="w-12 h-12 bg-black rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <Briefcase className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">Workbridg</span>
                        </Link>
                    </div>

                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Password reset successful!</h1>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Your password has been successfully reset. You can now log in with your new password.
                        </p>

                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center w-full py-4 px-6 border border-transparent text-sm font-medium rounded-2xl text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            Continue to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
            <div className={`w-full max-w-md transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2 mb-8 group">
                        <div className="w-12 h-12 bg-black rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <Briefcase className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">Workbridg</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Set new password</h1>
                    <p className="text-gray-600">Enter your new password below</p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                New password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all duration-300 hover:border-gray-300"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-600">Password strength</span>
                                        <span className={`text-xs font-medium ${
                                            passwordStrength.strength === 1 ? 'text-red-600' :
                                            passwordStrength.strength === 2 ? 'text-yellow-600' :
                                            passwordStrength.strength === 3 ? 'text-blue-600' :
                                            'text-green-600'
                                        }`}>
                                            {passwordStrength.text}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                            style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all duration-300 hover:border-gray-300"
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="mt-2 text-xs text-red-600">Passwords do not match</p>
                            )}
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Password must be at least 6 characters long. For better security, use a mix of letters, numbers, and special characters.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || formData.password !== formData.confirmPassword}
                            className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-medium rounded-2xl text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                "Reset password"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-sm text-gray-600 hover:text-black transition-colors duration-300"
                        >
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
