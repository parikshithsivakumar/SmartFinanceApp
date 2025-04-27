import { Document } from "@shared/schema";

interface DocumentCardProps {
  document: Document;
  onView: () => void;
  onDelete?: () => void;
  showDelete: boolean;
}

export default function DocumentCard({ document, onView, onDelete, showDelete }: DocumentCardProps) {
  // Format date
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
            <i className="ri-file-text-line text-gray-500 text-xl"></i>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{document.name}</div>
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {document.summary ? document.summary.substring(0, 100) + '...' : 'No summary available'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          document.fileType === 'Financial' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {document.fileType}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(document.uploadDate)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          document.complianceStatus === 'Pass'
            ? 'bg-green-100 text-green-800'
            : document.complianceStatus === 'Warning'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
        }`}>
          {document.complianceStatus}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <button 
          onClick={onView}
          className="text-primary-600 hover:text-primary-900 mr-3"
        >
          View
        </button>
        {showDelete && onDelete && (
          <button 
            onClick={onDelete}
            className="text-red-600 hover:text-red-900"
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  );
}
