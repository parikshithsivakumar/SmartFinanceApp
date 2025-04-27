export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
      <div className="bg-white p-5 rounded-lg shadow-xl flex items-center">
        <div className="loading-spinner rounded-full h-8 w-8 border-4 border-gray-200"></div>
        <span className="ml-3 text-gray-700 font-medium">Processing...</span>
      </div>
    </div>
  );
}
