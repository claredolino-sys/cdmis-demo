
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
  showProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, showProfile }) => {
  const { currentUser, logout } = useAuth();
  
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-[#323c4f] text-white shadow-md z-10">
      <div className="flex items-center">
        <button 
            onClick={toggleSidebar} 
            className="mr-4 text-gray-300 hover:text-white focus:outline-none"
            title="Toggle Sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <h1 className="text-xl font-semibold hidden md:block">Centralized Document Management Information System</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        
        {/* User Profile */}
        <div ref={dropdownRef} className="relative">
          <button 
            onClick={() => setDropdownOpen(!isDropdownOpen)} 
            className="flex items-center focus:outline-none"
            title="User Menu"
          >
            <div className="mr-4 text-right hidden sm:block">
                <p className="font-semibold">{currentUser?.name}</p>
                <p className="text-sm text-gray-300">{currentUser?.role}</p>
            </div>
            <img className="h-10 w-10 rounded-full object-cover" src={`https://ui-avatars.com/api/?name=${currentUser?.name}&background=random`} alt="User avatar" />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
              <button
                onClick={() => { showProfile(); setDropdownOpen(false); }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
              </button>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
