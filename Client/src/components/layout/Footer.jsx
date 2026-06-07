import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <GraduationCap className="w-6 h-6 text-primary-500" /> EduFlect
            </Link>
            <p className="text-sm leading-relaxed">Learn from India's best instructors. Grow your skills, advance your career.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Learn</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courses" className="hover:text-white transition-colors">All Courses</Link></li>
              <li><Link to="/courses?category=web" className="hover:text-white transition-colors">Web Development</Link></li>
              <li><Link to="/courses?category=data" className="hover:text-white transition-colors">Data Science</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Teach on EduFlect</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Follow Us</h3>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg hover:bg-gray-700 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="p-2 rounded-lg hover:bg-gray-700 transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="p-2 rounded-lg hover:bg-gray-700 transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} EduFlect. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
