import { useEffect, useState } from "react";

export default function LoadingOverlay() {
  const [visible, setVisible] = useState(true);
  
  // Add a 15-second timeout to remove the overlay in case it gets stuck
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 15000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
      <div className="bg-white p-5 rounded-lg shadow-xl flex items-center">
        <div className="w-8 h-8 border-t-2 border-b-2 border-primary-600 rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-700 font-medium">Processing...</span>
      </div>
    </div>
  );
}
