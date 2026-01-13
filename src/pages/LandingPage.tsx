import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Shield,
    Award,
    Clock,
    Code,
    Box,
    Palette,
    FileText,
    Brain,
    Video,
} from "lucide-react";
import { motion } from "framer-motion";

const LandingPage: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const brandLogos = [
        { name: "Nike", color: "bg-gray-900", icon: "W" },
        { name: "Pinterest", color: "bg-red-500", icon: "O" },
        { name: "Coinbase", color: "bg-blue-600", icon: "R" },
        { name: "Wise", color: "bg-green-500", icon: "K" },
        { name: "Headspace", color: "bg-orange-500", icon: "B" },
        { name: "Airbnb", color: "bg-pink-500", icon: "R" },
        { name: "Spotify", color: "bg-green-600", icon: "I" },
        { name: "Shopify", color: "bg-green-400", icon: "D" },
        { name: "Dropbox", color: "bg-blue-500", icon: "G" },
    ];

    // const testimonials = [
    //     {
    //         name: "Sarah Chen",
    //         role: "Product Designer",
    //         company: "TechCorp",
    //         content:
    //             "Workbridg transformed how we work with freelancers. The admin-mediated process eliminated all our previous disputes.",
    //         avatar: "👩‍💼",
    //     },
    //     {
    //         name: "Marcus Johnson",
    //         role: "Freelance Developer",
    //         company: "Independent",
    //         content:
    //             "Finally, a platform where I can focus on great work without worrying about payment issues or miscommunication.",
    //         avatar: "👨‍💻",
    //     },
    //     {
    //         name: "Elena Rodriguez",
    //         role: "Marketing Director",
    //         company: "StartupXYZ",
    //         content:
    //             "The quality of freelancers and the smooth process makes Workbridg our go-to platform for all projects.",
    //         avatar: "👩‍🎨",
    //     },
    // ];

    // const stats = [
    //     { number: "5,000+", label: "Active professionals", icon: Users },
    //     { number: "98%", label: "Project success rate", icon: CheckCircle },
    //     { number: "4.9/5", label: "Average rating", icon: Star },
    // ];

    const popularServices = [
        {
            icon: Code,
            title: "Web Development",
            description: "Custom solutions for web and mobile platforms",
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            icon: Box,
            title: "3D",
            description: "3D modeling, animation, and visualization",
            gradient: "from-purple-500 to-pink-500"
        },
        {
            icon: Palette,
            title: "Graphic Design & UI/UX",
            description: "Beautiful designs that engage users",
            gradient: "from-orange-500 to-red-500"
        },
        {
            icon: FileText,
            title: "Content Writing",
            description: "Compelling content that converts",
            gradient: "from-green-500 to-emerald-500"
        },
        {
            icon: Brain,
            title: "AI / Machine Learning",
            description: "Intelligent solutions powered by AI",
            gradient: "from-indigo-500 to-blue-500"
        },
        {
            icon: Video,
            title: "Video Editing",
            description: "Professional video production and editing",
            gradient: "from-pink-500 to-rose-500"
        }
    ];

    const features = [
        {
            icon: Shield,
            title: "Dispute-free collaboration",
            description:
                "All communication flows through our admin team, preventing misunderstandings and ensuring professionalism.",
            color: "bg-blue-50 text-blue-600",
        },
        {
            icon: Award,
            title: "Curated professionals",
            description:
                "Every freelancer is verified and vetted by our team to ensure quality and reliability.",
            color: "bg-green-50 text-green-600",
        },
        {
            icon: Clock,
            title: "Secure payments",
            description:
                "Payments are held securely until project completion, protecting both clients and freelancers.",
            color: "bg-purple-50 text-purple-600",
        },
    ];

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            {/* Floating Brand Icons */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
                {/* Left side → 4 logos */}
                {brandLogos.slice(0, 4).map((brand, i) => {
                    const count = 4;
                    const ySpacing = count > 1 ? 70 / (count - 1) : 0;
                    const topBase = 15 + i * ySpacing;
                    const jitter = ((i * 997) % 7) - 3; // tiny variation
                    const top = Math.min(90, Math.max(5, topBase + jitter));
                    const left = 5 + ((i * 17) % 35);

                    return (
                        <div
                            key={brand.name}
                            className={`absolute w-12 h-12 ${brand.color} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg animate-float`}
                            style={{
                                left: `${left}%`,
                                top: `${top}%`,
                                animationDelay: `${i * 0.45}s`,
                                animationDuration: `${4 + (i % 3)}s`
                            }}
                        >
                            {brand.icon}
                        </div>
                    );
                })}

                {/* Right side → 5 logos */}
                {brandLogos.slice(4, 9).map((brand, i) => {
                    const count = 5;
                    const ySpacing = count > 1 ? 70 / (count - 1) : 0;
                    const topBase = 15 + i * ySpacing;
                    const jitter = ((i * 991) % 7) - 3;
                    const top = Math.min(90, Math.max(5, topBase + jitter));
                    const left = 60 + ((i * 19) % 30);

                    return (
                        <div
                            key={brand.name}
                            className={`absolute w-12 h-12 ${brand.color} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg animate-float`}
                            style={{
                                left: `${left}%`,
                                top: `${top}%`,
                                animationDelay: `${i * 0.45}s`,
                                animationDuration: `${4 + (i % 3)}s`
                            }}
                        >
                            {brand.icon}
                        </div>
                    );
                })}
            </div>


            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 mt-10">
                <div className="max-w-6xl mx-auto text-center z-10">
                    <div
                        className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                    >
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-8">
                            The talent you wish you
                            <br />
                            <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                found sooner
                            </span>
                        </h1>

                        <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                            You focus on the work you need. We handle everything else.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                            <Link
                                to="/register"
                                className="group bg-black text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center"
                            >
                                Join for free
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/how-it-works"
                                className="group text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all duration-300 flex items-center"
                            >
                                See how Workbridg works
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Trusted by logos strip */}
                        {/* <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {brandLogos.slice(0, 6).map((brand, index) => (
                <div
                  key={brand.name}
                  className={`w-10 h-10 ${brand.color} rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md hover:scale-110 transition-transform duration-300`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {brand.icon}
                </div>
              ))}
            </div> */}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
           {/* <section className="py-24 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">

      <motion.h2
        className="text-4xl sm:text-5xl font-bold text-gray-900 mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        A growing library of
      </motion.h2>

      <div className="space-y-5">
        {[
          "5,000+ verified freelancers",
          "Reliable turnaround times",
          "Secure, escrow-backed payments",
          "Zero dispute track record"
        ].map((text, i) => (
          <motion.div
            key={text}
            className="text-4xl sm:text-6xl font-bold text-gray-900"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: i * 0.35 + 0.2,
              ease: "easeOut"
            }}
            viewport={{ once: true }}
          >
            {text}
          </motion.div>
        ))}
      </div>

    </div>
  </div>
</section> */}



            {/* Testimonials Section */}
            {/* <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            What our users are saying.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className={`bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${index === currentTestimonial
                                        ? "ring-2 ring-blue-500"
                                        : ""
                                    }`}
                            >
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl mr-4">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">
                                            {testimonial.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {testimonial.role}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {testimonial.company}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                    {testimonial.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section> */}

            {/* Popular Services Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            Popular Services
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Explore our most in-demand services from talented professionals
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {popularServices.map((service, index) => {
                            const isActive = service.title === "Web Development";
                            return (
                                <motion.div
                                    key={service.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={isActive ? { y: -8 } : {}}
                                    className="group"
                                >
                                    {isActive ? (
                                        <Link to="/services" className="block">
                                            <div className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-8 transition-all duration-300 hover:shadow-xl h-full">
                                                <div className={`w-16 h-16 rounded-lg bg-linear-to-br ${service.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                                    <service.icon className="h-8 w-8 text-white" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                                    {service.title}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {service.description}
                                                </p>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="bg-gray-100 border border-gray-200 rounded-xl p-8 h-full opacity-60 cursor-not-allowed">
                                            <div className="w-16 h-16 rounded-lg bg-gray-300 flex items-center justify-center mb-6">
                                                <service.icon className="h-8 w-8 text-gray-500" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-500 mb-3">
                                                {service.title}
                                            </h3>
                                            <p className="text-gray-400 mb-2">
                                                {service.description}
                                            </p>
                                            <p className="text-sm font-medium text-gray-500">
                                                Coming Soon
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            From inspiration to creation.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
                            >
                                <div
                                    className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <feature.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                        Freelancing, finally done right!
                        <br />
                    </h2>
                    <p className="text-xl text-gray-600 mb-12">
                        Join thousands of professionals who trust Workbridg for
                        their freelance projects.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            to="/register"
                            className="group bg-black text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center"
                        >
                            Join for free
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/how-it-works"
                            className="group text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center border border-gray-200"
                        >
                            See how Workbridg works
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
