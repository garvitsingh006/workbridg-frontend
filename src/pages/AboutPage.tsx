import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Target, Award, Heart, Zap, ArrowRight, CircleCheck as CheckCircle, Sparkles, Globe, TrendingUp } from 'lucide-react';

const AboutPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const floatingIcons = [
    { icon: '🚀', color: 'bg-blue-500', delay: '0s' },
    { icon: '⭐', color: 'bg-yellow-500', delay: '1s' },
    { icon: '💎', color: 'bg-purple-500', delay: '2s' },
    { icon: '🎯', color: 'bg-green-500', delay: '0.5s' },
    { icon: '🔥', color: 'bg-red-500', delay: '1.5s' },
    { icon: '✨', color: 'bg-pink-500', delay: '2.5s' },
  ];

  const stats = [
    { number: '5,000+', label: 'Active professionals' },
    { number: '98%', label: 'Project success rate' },
    { number: '4.9/5', label: 'Average rating' },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Floating Icons */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {floatingIcons.map((item, index) => (
          <div
            key={index}
            className={`absolute w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg animate-float opacity-20`}
            style={{
              left: `${10 + (index * 15) % 80}%`,
              top: `${15 + (index * 20) % 70}%`,
              animationDelay: item.delay,
              animationDuration: `${4 + (index % 3)}s`
            }}
          >
            {item.icon}
          </div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center z-10">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-6 py-3 mb-8">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">About Workbridg</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-8">
              Never run out of
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                talent again.
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              We're revolutionizing freelance collaboration by eliminating disputes and ensuring 
              professional standards through our unique admin-mediated approach.
            </p>

            {/* Animated Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`transform transition-all duration-500 ${
                    currentStat === index ? 'scale-110' : 'scale-100'
                  }`}
                >
                  <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              What our users are saying.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Our Mission</h3>
                    <p className="text-sm text-gray-600">Building the future</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  At Workbridg, we believe that freelance work should be built on trust, transparency, and professionalism. 
                  Our mission is to create a platform where clients and freelancers can collaborate seamlessly.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Globe className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Global Impact</h3>
                    <p className="text-sm text-gray-600">Worldwide reach</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  By positioning our admin team as mediators in every interaction, we ensure that both parties 
                  receive the support they need to deliver exceptional results.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-12 h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <TrendingUp className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">98% Success Rate</h3>
                  <p className="text-gray-600 max-w-sm">
                    Our admin-mediated process has achieved a 98% project success rate, 
                    with virtually zero disputes reported.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              From inspiration to creation.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Trust & Security',
                description: 'We prioritize the security of payments, data, and communications, ensuring all parties feel confident throughout their collaboration.',
                color: 'bg-blue-50 text-blue-600',
                bgGradient: 'from-blue-50 to-blue-100'
              },
              {
                icon: Users,
                title: 'Quality First',
                description: 'Every freelancer is carefully vetted, and every project is monitored to maintain the highest standards of work quality.',
                color: 'bg-green-50 text-green-600',
                bgGradient: 'from-green-50 to-green-100'
              },
              {
                icon: Heart,
                title: 'Human-Centered',
                description: 'Our admin team provides personal attention to every project, ensuring human oversight in an increasingly automated world.',
                color: 'bg-purple-50 text-purple-600',
                bgGradient: 'from-purple-50 to-purple-100'
              },
              {
                icon: Zap,
                title: 'Efficiency',
                description: 'Streamlined processes and clear communication channels ensure projects move forward smoothly without unnecessary delays.',
                color: 'bg-yellow-50 text-yellow-600',
                bgGradient: 'from-yellow-50 to-yellow-100'
              },
              {
                icon: Award,
                title: 'Excellence',
                description: 'We strive for excellence in every interaction, from initial project discussions to final delivery and payment processing.',
                color: 'bg-red-50 text-red-600',
                bgGradient: 'from-red-50 to-red-100'
              },
              {
                icon: CheckCircle,
                title: 'Reliability',
                description: 'Consistent processes, dependable support, and reliable outcomes that both clients and freelancers can count on.',
                color: 'bg-indigo-50 text-indigo-600',
                bgGradient: 'from-indigo-50 to-indigo-100'
              },
            ].map((value, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${value.bgGradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className={`w-8 h-8 ${value.color.split(' ')[1]}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Find design patterns
            <br />
            in seconds.
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join thousands of professionals who trust Workbridg for their freelance projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/register" 
              className="group bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center"
            >
              Join for free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/how-it-works" 
              className="group text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center border border-white/20"
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

export default AboutPage;