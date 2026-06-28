import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#15803d] text-white py-10 px-6 sm:px-8 lg:px-12 font-sans mt-auto w-full">
      {/* Top Container */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-10 lg:gap-8 border-b border-white/20 pb-10">
        
        {/* Brand Section */}
        <div className="flex-1 lg:max-w-sm">
          <div className="text-2xl font-bold mb-3">
            RentNest<span className="text-[#bae6fd]"> Kerala</span>
          </div>
          <p className="text-sm text-[#e2e8f0] leading-relaxed">
            Find your perfect stay in God's Own Country. We connect house owners and tenants easily and securely.
          </p>
        </div>

        {/* Links Section */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-10 sm:gap-16 lg:gap-20">
          
          {/* About Column */}
          <div className="flex flex-col gap-3">
            <span className="text-base font-semibold text-[#bae6fd] mb-1">About</span>
            <Link to="/about" className="text-sm text-[#f1f5f9] hover:text-white hover:underline transition-colors duration-200">
              Our Story
            </Link>
            <Link to="/careers" className="text-sm text-[#f1f5f9] hover:text-white hover:underline transition-colors duration-200">
              Careers
            </Link>
            <Link to="/blog" className="text-sm text-[#f1f5f9] hover:text-white hover:underline transition-colors duration-200">
              Blog
            </Link>
          </div>

          {/* Terms Column */}
          <div className="flex flex-col gap-3">
            <span className="text-base font-semibold text-[#bae6fd] mb-1">Terms</span>
            <Link to="/privacy" className="text-sm text-[#f1f5f9] hover:text-white hover:underline transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-[#f1f5f9] hover:text-white hover:underline transition-colors duration-200">
              Terms of Service
            </Link>
            <Link to="/safety" className="text-sm text-[#f1f5f9] hover:text-white hover:underline transition-colors duration-200">
              Trust & Safety
            </Link>
          </div>

          {/* Contact Column */}
          <div className="flex flex-col gap-3">
            <span className="text-base font-semibold text-[#bae6fd] mb-1">Contact</span>
            <Link to="/help" className="text-sm text-[#f1f5f9] hover:text-white hover:underline transition-colors duration-200">
              Help Center
            </Link>
            <Link to="/support" className="text-sm text-[#f1f5f9] hover:text-white hover:underline transition-colors duration-200">
              Local Support
            </Link>
            <Link to="/advertise" className="text-sm text-[#f1f5f9] hover:text-white hover:underline transition-colors duration-200">
              Advertise
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-6 flex flex-col-reverse sm:flex-row justify-between items-center gap-5 text-sm text-[#cbd5e1]">
        <div className="text-center sm:text-left">
          &copy; {new Date().getFullYear()} RentNest Kerala. All rights reserved.
        </div>
        
        {/* Social Links */}
        <div className="flex gap-5">
          <a href="#" className="text-white hover:text-[#bae6fd] hover:scale-110 transition-all duration-200 font-medium" aria-label="Facebook">
            FB
          </a>
          <a href="#" className="text-white hover:text-[#bae6fd] hover:scale-110 transition-all duration-200 font-medium" aria-label="Instagram">
            IG
          </a>
          <a href="#" className="text-white hover:text-[#bae6fd] hover:scale-110 transition-all duration-200 font-medium" aria-label="Twitter">
            TW
          </a>
          <a href="#" className="text-white hover:text-[#bae6fd] hover:scale-110 transition-all duration-200 font-medium" aria-label="LinkedIn">
            LN
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;