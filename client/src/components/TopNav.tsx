import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export default function TopNav() {
  const { user, logoutMutation } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 md:px-6">
      <div className="flex items-center md:hidden">
        <button 
          className="text-gray-500 focus:outline-none" 
          onClick={toggleMobileMenu}
        >
          <i className="ri-menu-line text-2xl"></i>
        </button>
      </div>
      
      <div className="flex items-center ml-auto">
        <div className="relative">
          <button 
            className="flex items-center text-sm focus:outline-none" 
            onClick={toggleUserMenu}
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="ml-2 text-gray-700 hidden md:inline-block">
              {user?.name || "User"}
            </span>
            <i className="ri-arrow-down-s-line ml-1 text-gray-500"></i>
          </button>
          
          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
              <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Your Profile
              </div>
              <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Settings
              </div>
              <div 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" 
                onClick={() => logoutMutation.mutate()}
              >
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-900">
            <div className="flex items-center h-16 px-4 bg-gray-800">
              <h1 className="text-xl font-bold text-white">Smart Finance</h1>
              <button 
                className="ml-auto text-gray-300 focus:outline-none" 
                onClick={toggleMobileMenu}
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
            
            <div className="flex-1 h-0 overflow-y-auto">
              <nav className="flex-1 px-4 py-5 space-y-1">
                <Link href="/dashboard">
                  <a className="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-800 hover:text-white group" onClick={toggleMobileMenu}>
                    <i className="ri-dashboard-line mr-3 text-lg"></i>
                    <span>Dashboard</span>
                  </a>
                </Link>
                
                <Link href="/upload">
                  <a className="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-800 hover:text-white group" onClick={toggleMobileMenu}>
                    <i className="ri-upload-2-line mr-3 text-lg"></i>
                    <span>Upload Document</span>
                  </a>
                </Link>
                
                <Link href="/history">
                  <a className="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-800 hover:text-white group" onClick={toggleMobileMenu}>
                    <i className="ri-history-line mr-3 text-lg"></i>
                    <span>Document History</span>
                  </a>
                </Link>
                
                <div 
                  className="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-800 hover:text-white group cursor-pointer mt-8" 
                  onClick={() => logoutMutation.mutate()}
                >
                  <i className="ri-logout-box-line mr-3 text-lg"></i>
                  <span>Sign Out</span>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
