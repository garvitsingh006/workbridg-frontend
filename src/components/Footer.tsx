import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin, ArrowRight, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-2xl"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full"></div>
        <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-white rounded-2xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-gray-900" />
              </div>
              <span className="text-2xl font-bold">Workbridg</span>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed max-w-md">
              Curated freelance platform ensuring professional collaboration between clients and freelancers through admin-mediated processes.
            </p>
            <div className="flex items-center space-x-2 text-gray-300">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for the freelance community</span>
            </div>
          </div>
          
          {/* Platform Links */}
          <div>
            <h3 className="font-bold text-white mb-6 text-lg">Platform</h3>
            <div className="space-y-4">
              {[
                { to: "/how-it-works", label: "How it works" },
                { to: "/freelancers", label: "For Freelancers" },
                { to: "/clients", label: "For Clients" },
                { to: "/pricing", label: "Pricing" }
              ].map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className="group flex items-center text-gray-300 hover:text-white transition-all duration-300"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    {link.label}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </Link>
              ))}
            </div>
          </div>
          
          {/* Support Links */}
          <div>
            <h3 className="font-bold text-white mb-6 text-lg">Support</h3>
            <div className="space-y-4">
              {[
                { to: "/help", label: "Help Center" },
                { to: "/terms", label: "Terms of Service" },
                { to: "/privacy", label: "Privacy Policy" },
                { to: "/contact", label: "Contact Us" }
              ].map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className="group flex items-center text-gray-300 hover:text-white transition-all duration-300"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    {link.label}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <h3 className="font-bold text-white mb-6 text-lg">Get in Touch</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Email</div>
                    <div className="font-medium">support@workbridg.com</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Phone</div>
                    <div className="font-medium">+1 (555) 123-4567</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Location</div>
                    <div className="font-medium">San Francisco, CA</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="lg:col-span-2">
              <h3 className="font-bold text-white mb-6 text-lg">Stay Updated</h3>
              <p className="text-gray-300 mb-4">
                Get the latest updates on new features and opportunities.
              </p>
              <div className="flex space-x-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 font-semibold">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-gray-400 text-sm">
            © {currentYear} Workbridg. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy
            </Link>
            <Link to="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;