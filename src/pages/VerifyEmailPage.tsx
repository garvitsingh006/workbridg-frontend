import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Mail,
    CheckCircle,
    Sparkles,
    Heart,
    Star,
    Zap,
    Briefcase,
} from "lucide-react";
import { useUser } from "../contexts/UserContext";

const VerifyEmailPage: React.FC = () => {
    const { fetchUser, fetchLoginDetails } = useUser();
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async () => {
            try {
                const userData = await fetchLoginDetails();
                if (!userData || !userData.email) {
                    navigate("/register");
                    console.log("No user data found, redirecting to register.");
                    return;
                }
                setEmail(userData.email);
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };

        getUser();
    }, []);

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const floatingElements = [
        {
            icon: Sparkles,
            color: "bg-blue-500",
            delay: "0s",
            size: "w-12 h-12",
        },
        { icon: Zap, color: "bg-green-500", delay: "1s", size: "w-10 h-10" },
        { icon: Heart, color: "bg-pink-500", delay: "2s", size: "w-14 h-14" },
        { icon: Star, color: "bg-yellow-500", delay: "0.5s", size: "w-8 h-8" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Floating Elements */}
            {floatingElements.map((element, index) => (
                <div
                    key={index}
                    className={`absolute ${element.size} ${element.color} rounded-3xl flex items-center justify-center text-white shadow-2xl animate-float opacity-10`}
                    style={{
                        left: `${10 + ((index * 20) % 80)}%`,
                        top: `${10 + ((index * 25) % 80)}%`,
                        animationDelay: element.delay,
                        animationDuration: `${4 + (index % 3)}s`,
                    }}
                >
                    <element.icon className="w-1/2 h-1/2" />
                </div>
            ))}

            <div
                className={`max-w-lg w-full relative z-10 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center space-x-2 group"
                    >
                        <div className="w-14 h-14 bg-black rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                            <Briefcase className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-gray-900">
                            Workbridg
                        </span>
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-10 backdrop-blur-sm border border-gray-200">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl animate-bounce-slow">
                                <Mail className="w-12 h-12 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Check your email
                        </h1>

                        <p className="text-lg text-gray-600 leading-relaxed">
                            We've sent a verification link to
                        </p>

                        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-4 border border-blue-100">
                            <p className="text-xl font-semibold text-gray-900 break-all">
                                {email}
                            </p>
                        </div>

                        <p className="text-gray-600 leading-relaxed pt-2">
                            Click the link in the email to verify your account
                            and start your journey with Workbridg.
                        </p>

                        {/* Info Box */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mt-6">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">
                                            !
                                        </span>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm text-yellow-800 font-medium mb-1">
                                        Important
                                    </p>
                                    <p className="text-sm text-yellow-700">
                                        You need to verify your email before you
                                        can log in. Check your spam folder if
                                        you don't see the email.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 space-y-4">
                        <Link
                            to="/login"
                            className="w-full flex justify-center items-center py-4 px-4 border-2 border-black text-sm font-medium rounded-2xl text-black bg-white hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            Go to login page
                        </Link>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300 py-2"
                        >
                            Didn't receive the email? Check spam or contact
                            support
                        </button>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Need help?{" "}
                        <a
                            href="mailto:support@workbridg.com"
                            className="font-medium text-black hover:text-gray-800 transition-colors duration-300"
                        >
                            Contact support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
