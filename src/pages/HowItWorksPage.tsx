import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Shield, ArrowRight, CheckCircle, MessageSquare, FileText, CreditCard, Star } from 'lucide-react';

const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            How Workbridg Works
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Our admin-mediated process ensures smooth collaboration between clients and freelancers, 
            eliminating disputes and maintaining professional standards throughout every project.
          </p>
        </div>
      </section>

      {/* Process Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Three-Way Collaboration</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every project involves three key players working together to ensure success
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Briefcase className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Clients</h3>
              <p className="text-gray-600">
                Post projects, review proposals, and receive high-quality deliverables with complete transparency.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Freelancers</h3>
              <p className="text-gray-600">
                Access curated projects, work with verified clients, and get paid securely for quality work.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Admin</h3>
              <p className="text-gray-600">
                Mediates all communication, ensures quality standards, and facilitates secure payments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Freelancer Journey */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Freelancer Journey</h2>
            <p className="text-lg text-gray-600">From signup to payment - a seamless experience</p>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="lg:w-1/2">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-4">1</div>
                  <h3 className="text-xl font-semibold text-gray-900">Sign Up & Verification</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Create your account with email/OTP verification. Build a detailed profile showcasing your skills, 
                  experience, portfolio, and references.
                </p>
                <div className="flex items-center text-sm text-blue-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Automated welcome package included
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-white rounded-lg p-8 shadow-sm border">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Profile Creation</div>
                        <div className="text-sm text-gray-500">Skills, experience, portfolio</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Verification</div>
                        <div className="text-sm text-gray-500">Email & OTP confirmation</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row-reverse items-center gap-8">
              <div className="lg:w-1/2">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-4">2</div>
                  <h3 className="text-xl font-semibold text-gray-900">Project Assignment</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Admin shares suitable project details through your dedicated chatbox. Once accepted, 
                  view project details and agreements in your "My Projects" dashboard.
                </p>
                <div className="flex items-center text-sm text-blue-600">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  All communication via Admin chatbox
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-white rounded-lg p-8 shadow-sm border">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Admin Communication</div>
                        <div className="text-sm text-gray-500">Project details & requirements</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Project Dashboard</div>
                        <div className="text-sm text-gray-500">Agreements & documentation</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="lg:w-1/2">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-4">3</div>
                  <h3 className="text-xl font-semibold text-gray-900">Delivery & Payment</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Deliver work through the platform, communicate progress updates, and upload submissions. 
                  Upon completion, receive secure payments with invoices stored in your dashboard.
                </p>
                <div className="flex items-center text-sm text-blue-600">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Secure payment processing
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-white rounded-lg p-8 shadow-sm border">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Work Submission</div>
                        <div className="text-sm text-gray-500">Upload deliverables & progress</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Payment Release</div>
                        <div className="text-sm text-gray-500">Secure & timely payments</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Journey */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Client Journey</h2>
            <p className="text-lg text-gray-600">From project posting to delivery - simplified and secure</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-50 rounded-lg p-6 mb-4">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Sign Up & Profile</h3>
                <p className="text-sm text-gray-600">Create account, verify, and build your client profile</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-green-50 rounded-lg p-6 mb-4">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Post Project</h3>
                <p className="text-sm text-gray-600">Submit requirements, budget, and timeline details</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-purple-50 rounded-lg p-6 mb-4">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Admin Consultation</h3>
                <p className="text-sm text-gray-600">Review shortlisted freelancers and select the best fit</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-yellow-50 rounded-lg p-6 mb-4">
                <div className="bg-yellow-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Project Completion</h3>
                <p className="text-sm text-gray-600">Receive deliverables and review freelancer performance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to experience dispute-free collaboration?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join Workbridg today and see how our admin-mediated process transforms freelance work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center group"
            >
              Get started now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/about" 
              className="border border-blue-400 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Learn more about us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;