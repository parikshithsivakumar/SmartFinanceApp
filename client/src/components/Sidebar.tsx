import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-gray-900">
        <div className="flex items-center h-16 px-4 bg-gray-800">
          <h1 className="text-xl font-bold text-white">Smart Finance</h1>
        </div>
        
        <div className="flex flex-col flex-grow px-4 py-5">
          <div className="flex flex-col flex-grow">
            <nav className="flex-1 space-y-1">
              <Link href="/dashboard">
                <a className={`flex items-center px-4 py-2 rounded-md group ${
                  isActive("/dashboard") 
                    ? "text-white bg-gray-800" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}>
                  <i className="ri-dashboard-line mr-3 text-lg"></i>
                  <span>Dashboard</span>
                </a>
              </Link>
              
              <Link href="/upload">
                <a className={`flex items-center px-4 py-2 rounded-md group ${
                  isActive("/upload") 
                    ? "text-white bg-gray-800" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}>
                  <i className="ri-upload-2-line mr-3 text-lg"></i>
                  <span>Upload Document</span>
                </a>
              </Link>
              
              <Link href="/history">
                <a className={`flex items-center px-4 py-2 rounded-md group ${
                  isActive("/history") 
                    ? "text-white bg-gray-800" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}>
                  <i className="ri-history-line mr-3 text-lg"></i>
                  <span>Document History</span>
                </a>
              </Link>
            </nav>
          </div>
          
          <div className="mt-auto">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                logout();
              }}
              className="flex items-center px-4 py-2 text-gray-300 rounded-md hover:bg-gray-800 hover:text-white group"
            >
              <i className="ri-logout-box-line mr-3 text-lg"></i>
              <span>Sign Out</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
