import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Workbridg</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-all duration-300 hover:scale-105 ${
                isActive('/') ? 'text-black' : 'text-gray-600 hover:text-black'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/how-it-works" 
              className="text-sm font-medium text-gray-600 hover:text-black transition-all duration-300 hover:scale-105"
            >
              How it works
            </Link>
            <Link 
              to="/about" 
              className="text-sm font-medium text-gray-600 hover:text-black transition-all duration-300 hover:scale-105"
            >
              About
            </Link>
            <Link 
              to="/login" 
              className={`text-sm font-medium transition-all duration-300 hover:scale-105 ${
                isActive('/login') ? 'text-black' : 'text-gray-600 hover:text-black'
              }`}
            >
              Log in
            </Link>
            <Link 
              to="/register" 
              className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Join for free
            </Link>
          </nav>

          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 space-y-4 bg-white/95 backdrop-blur-md rounded-2xl mt-2 shadow-xl">
            <Link 
              to="/" 
              className="block px-6 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg mx-2 transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/how-it-works" 
              className="block px-6 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg mx-2 transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              How it works
            </Link>
            <Link 
              to="/about" 
              className="block px-6 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg mx-2 transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/login" 
              className="block px-6 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg mx-2 transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Log in
            </Link>
            <Link 
              to="/register" 
              className="block mx-2 px-6 py-3 text-base font-medium bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Join for free
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;