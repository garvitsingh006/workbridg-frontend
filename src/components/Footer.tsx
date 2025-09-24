import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">Workbridg</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Curated freelance platform ensuring professional collaboration between clients and freelancers.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
            <div className="space-y-3">
              <Link to="/how-it-works" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                How it works
              </Link>
              <Link to="/freelancers" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                For Freelancers
              </Link>
              <Link to="/clients" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                For Clients
              </Link>
              <Link to="/pricing" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Pricing
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <div className="space-y-3">
              <Link to="/help" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Help Center
              </Link>
              <Link to="/terms" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/contact" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>support@workbridg.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            © 2025 Workbridg. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;