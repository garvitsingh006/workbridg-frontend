import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Shield, ArrowRight, CheckCircle, FileText, CreditCard, Star, Sparkles } from 'lucide-react';

const HowItWorks = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [, setActiveStep] = useState(0);

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
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-6xl mx-auto text-center z-10">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-6 py-3 mb-8">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">How it works</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-8">
              Talent You Can Trust.
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                 A Process You Can Rely On
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Our admin-mediated process ensures smooth collaboration between clients and freelancers, 
              eliminating disputes and maintaining professional standards.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link 
                to="/register" 
                className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="flex flex-col items-center">
                <Shield className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-900 mb-2">100%</h3>
                <p className="text-gray-600">Verified</p>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Secure</h3>
                <p className="text-gray-600">Escrow</p>
              </div>
              <div className="flex flex-col items-center">
                <Star className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Rated</h3>
                <p className="text-gray-600">Freelancers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              How <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Workbridg</span> Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A streamlined process designed for success
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 transform -translate-x-1/2"></div>

            {/* Steps */}
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`relative mb-24 last:mb-0 ${
                  index % 2 === 0 ? 'md:pr-1/2' : 'md:pl-1/2 md:ml-auto'
                }`}
              >
                <div className={`flex items-center gap-6 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Step Number Circle */}
                  <div
  className={`
    hidden md:flex absolute top-1/2 -translate-y-1/2 w-20 h-20
    rounded-full bg-white border-4 border-purple-600 
    items-center justify-center shadow-lg z-20
    ${index % 2 === 0 ? "-right-10" : "-left-10"}
  `}
>

                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {step.number}
                    </span>
                  </div>

                  {/* Content Card */}
                  <div className={`flex-1 bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${
                    index % 2 === 0 ? 'md:mr-24' : 'md:ml-24'
                  }`}>
                    <div className="flex items-start gap-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Freelancers */}
            <div className="space-y-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">For Freelancers</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">One-Time Interview</h4>
                    <p className="text-gray-600">Undergo a comprehensive interview to verify your skills and expertise</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <Star className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Skill Rating</h4>
                    <p className="text-gray-600">Receive a rating based on your skills, experience, and performance</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <Briefcase className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Apply to Projects</h4>
                    <p className="text-gray-600">Only verified freelancers with ratings can apply to client projects</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clients */}
            <div className="space-y-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">For Clients</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <FileText className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Post Projects</h4>
                    <p className="text-gray-600">Create detailed project listings with clear requirements and expectations</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <Star className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">View Ratings</h4>
                    <p className="text-gray-600">Browse verified freelancers with transparent ratings provided by Workbridg</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Clear Requirements</h4>
                    <p className="text-gray-600">Define project deliverables and agree on terms before work begins</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Workflow Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Project Workflow</h2>
            <p className="text-xl text-gray-600">From initiation to completion</p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Project Initiation</h4>
                  <p className="text-gray-600">Client selects a freelancer and both parties confirm project details in a standardized form</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Secure Payment</h4>
                  <p className="text-gray-600">Client makes full advance payment, which is securely held in escrow by Workbridg for protection</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Project Oversight</h4>
                  <p className="text-gray-600">A Workbridg team member oversees project chat and progress. Both parties can contact support for assistance</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Completion & Approval</h4>
                  <p className="text-gray-600">Freelancer submits completed work for client approval. Payment is released upon approval</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payments & Escrow Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-xl mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Payments & Escrow</h2>
            <p className="text-xl text-gray-600">Transparent, secure, and reliable payment handling</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Escrow Protection */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Escrow Protection</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-600">All client payments are held in escrow until project completion and approval</p>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-600">Platform commission and service charges are deducted automatically at release</p>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-600">Workbridg is not liable for delays due to banking or technical issues</p>
                </li>
              </ul>
            </div>

            {/* Fee Structure */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Fee Structure</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-900">Platform Commission</span>
                    <span className="text-2xl font-bold text-blue-600">8%</span>
                  </div>
                  <p className="text-sm text-gray-600">Platform maintenance and operations</p>
                </div>
                
                <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-900">Service Charge</span>
                    <span className="text-2xl font-bold text-purple-600">5%</span>
                  </div>
                  <p className="text-sm text-gray-600">Platform support and management services</p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Fee</span>
                    <span className="text-3xl font-bold">13%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Join thousands of freelancers and clients building successful projects together
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-blue-600 bg-white rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              Join as Freelancer
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-white bg-transparent border-2 border-white rounded-2xl hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Hire as a Client
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
