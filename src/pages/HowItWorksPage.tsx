import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Shield, ArrowRight, CircleCheck as CheckCircle, MessageSquare, FileText, CreditCard, Star, Sparkles, Zap } from 'lucide-react';

const HowItWorksPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const floatingElements = [
    { icon: '💼', color: 'bg-blue-500', delay: '0s' },
    { icon: '🤝', color: 'bg-green-500', delay: '1s' },
    { icon: '⚡', color: 'bg-purple-500', delay: '2s' },
    { icon: '🎯', color: 'bg-orange-500', delay: '0.5s' },
    { icon: '🚀', color: 'bg-red-500', delay: '1.5s' },
  ];

  const steps = [
    {
      number: '01',
      title: 'Sign Up & Verification',
      description: 'Create your account with email/OTP verification. Build a detailed profile showcasing your skills.',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      number: '02', 
      title: 'Project Assignment',
      description: 'Admin shares suitable project details through your dedicated chatbox. Accept and start working.',
      icon: Briefcase,
      color: 'from-green-500 to-green-600'
    },
    {
      number: '03',
      title: 'Delivery & Payment',
      description: 'Deliver work through the platform and receive secure payments with invoices stored in your dashboard.',
      icon: CreditCard,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {floatingElements.map((item, index) => (
          <div
            key={index}
            className={`absolute w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg animate-float opacity-20`}
            style={{
              left: `${10 + (index * 18) % 80}%`,
              top: `${15 + (index * 25) % 70}%`,
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
              <span className="text-sm font-medium text-gray-700">How it works</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-8">
              Find design patterns
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                in seconds.
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Our admin-mediated process ensures smooth collaboration between clients and freelancers, 
              eliminating disputes and maintaining professional standards.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link 
                to="/register" 
                className="group bg-black text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center"
              >
                Join for free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/about" 
                className="group text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center border border-gray-200"
              >
                See our plans
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Three-Way Collaboration */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              What our users are saying.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Briefcase,
                title: 'Clients',
                description: 'Post projects, review proposals, and receive high-quality deliverables with complete transparency.',
                color: 'from-blue-50 to-blue-100',
                iconColor: 'text-blue-600'
              },
              {
                icon: Users,
                title: 'Freelancers', 
                description: 'Access curated projects, work with verified clients, and get paid securely for quality work.',
                color: 'from-green-50 to-green-100',
                iconColor: 'text-green-600'
              },
              {
                icon: Shield,
                title: 'Admin',
                description: 'Mediates all communication, ensures quality standards, and facilitates secure payments.',
                color: 'from-purple-50 to-purple-100',
                iconColor: 'text-purple-600'
              }
            ].map((role, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${role.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <role.icon className={`w-8 h-8 ${role.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{role.title}</h3>
                <p className="text-gray-600 leading-relaxed">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              From inspiration to creation.
            </h2>
          </div>

          <div className="space-y-16">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                } ${activeStep === index ? 'scale-105' : 'scale-100'} transition-all duration-500`}
              >
                <div className="lg:w-1/2">
                  <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center mb-6">
                      <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white font-bold mr-4`}>
                        {step.number}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                    
                    <div className="mt-6 flex items-center text-blue-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">Automated process included</span>
                    </div>
                  </div>
                </div>

                <div className="lg:w-1/2">
                  <div className={`bg-gradient-to-br ${step.color} rounded-3xl p-12 h-80 flex items-center justify-center`}>
                    <div className="text-center text-white">
                      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <step.icon className="w-12 h-12 text-white" />
                      </div>
                      <h4 className="text-xl font-bold mb-2">Step {step.number}</h4>
                      <p className="text-white/80">Professional workflow</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Journey */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, title: 'Sign Up & Profile', description: 'Create account, verify, and build your client profile', color: 'from-blue-50 to-blue-100' },
              { icon: FileText, title: 'Post Project', description: 'Submit requirements, budget, and timeline details', color: 'from-green-50 to-green-100' },
              { icon: Shield, title: 'Admin Consultation', description: 'Review shortlisted freelancers and select the best fit', color: 'from-purple-50 to-purple-100' },
              { icon: Star, title: 'Project Completion', description: 'Receive deliverables and review freelancer performance', color: 'from-yellow-50 to-yellow-100' }
            ].map((item, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
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
            Ready to experience
            <br />
            dispute-free collaboration?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join Workbridg today and see how our admin-mediated process transforms freelance work.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/register" 
              className="group bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center"
            >
              Get started now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/about" 
              className="group text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center border border-white/20"
            >
              Learn more about us
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;