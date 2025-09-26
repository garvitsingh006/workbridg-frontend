import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, CheckCircle, Users, Shield, Award, Briefcase, MessageSquare, Zap, Heart, Target, Clock } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const brandLogos = [
    { name: 'Uber', color: 'bg-black', icon: '🚗' },
    { name: 'Nike', color: 'bg-gray-900', icon: '✓' },
    { name: 'Pinterest', color: 'bg-red-500', icon: 'P' },
    { name: 'Coinbase', color: 'bg-blue-600', icon: 'C' },
    { name: 'Wise', color: 'bg-green-500', icon: 'W' },
    { name: 'Headspace', color: 'bg-orange-500', icon: '●' },
    { name: 'Airbnb', color: 'bg-pink-500', icon: 'A' },
    { name: 'Spotify', color: 'bg-green-600', icon: '♪' },
    { name: 'Shopify', color: 'bg-green-400', icon: 'S' },
    { name: 'Dropbox', color: 'bg-blue-500', icon: '□' },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Designer',
      company: 'TechCorp',
      content: 'Workbridg transformed how we work with freelancers. The admin-mediated process eliminated all our previous disputes.',
      avatar: '👩‍💼'
    },
    {
      name: 'Marcus Johnson',
      role: 'Freelance Developer',
      company: 'Independent',
      content: 'Finally, a platform where I can focus on great work without worrying about payment issues or miscommunication.',
      avatar: '👨‍💻'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Marketing Director',
      company: 'StartupXYZ',
      content: 'The quality of freelancers and the smooth process makes Workbridg our go-to platform for all projects.',
      avatar: '👩‍🎨'
    }
  ];

  const stats = [
    { number: '5,000+', label: 'Active professionals', icon: Users },
    { number: '98%', label: 'Project success rate', icon: CheckCircle },
    { number: '4.9/5', label: 'Average rating', icon: Star },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Dispute-free collaboration',
      description: 'All communication flows through our admin team, preventing misunderstandings and ensuring professionalism.',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: Award,
      title: 'Curated professionals',
      description: 'Every freelancer is verified and vetted by our team to ensure quality and reliability.',
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: Clock,
      title: 'Secure payments',
      description: 'Payments are held securely until project completion, protecting both clients and freelancers.',
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Floating Brand Icons */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {brandLogos.map((brand, index) => (
          <div
            key={brand.name}
            className={`absolute w-12 h-12 ${brand.color} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg animate-float`}
            style={{
              left: `${10 + (index * 8) % 80}%`,
              top: `${15 + (index * 12) % 70}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${4 + (index % 3)}s`
            }}
          >
            {brand.icon}
          </div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center z-10">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-8">
              Never run out of
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                talent again.
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Use Workbridg for free as long as you like or get full access with any of our paid plans.
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
                See our plans
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trusted by logos strip */}
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {brandLogos.slice(0, 6).map((brand, index) => (
                <div
                  key={brand.name}
                  className={`w-10 h-10 ${brand.color} rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md hover:scale-110 transition-transform duration-300`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {brand.icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              A growing library of
            </h2>
            <div className="space-y-4">
              <div className="text-6xl sm:text-7xl font-bold text-gray-900">5,000+ professionals</div>
              <div className="text-6xl sm:text-7xl font-bold text-gray-900">98% success rate</div>
              <div className="text-6xl sm:text-7xl font-bold text-gray-900">Zero disputes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
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
                className={`bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                  index === currentTestimonial ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.company}</div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{testimonial.content}</p>
              </div>
            ))}
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
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Find design patterns
            <br />
            in seconds.
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands of professionals who trust Workbridg for their freelance projects.
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
              See our plans
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;